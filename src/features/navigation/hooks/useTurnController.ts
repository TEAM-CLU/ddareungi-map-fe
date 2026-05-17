import { useEffect, useRef, type RefObject } from 'react';
import { Coordinate } from '@/shared/model/shared.types';
import {
  ACCURACY_OK,
  MOTION_COMMON_OPTIONS,
  TURN_CONFIG,
} from '@/features/navigation/model/navigation.constants';
import {
  IntervalPathData,
  LocationMetaData,
  NavigationInstruction,
} from '@/features/navigation/model/navigation.types';
import { calculateMotionVector } from '@/features/navigation/utils/calculateMotionVector';
import {
  calculateIntervalDistanceByMyPosition,
  findClosestSegmentProjection,
} from '@/features/navigation/utils/navigationController';
import { getDistanceBetweenCoords } from '@/shared/utils/measure';
import { writeNavigationQaLog } from '@/features/navigation/utils/navigationQaLog';

export interface UseTurnControllerParams {
  isNavigationMode: boolean;
  isNavigationInitialized: boolean;
  locationMetaData: LocationMetaData | null;
  currentInstruction: NavigationInstruction | null;
  setCurrentInstruction: (inst: NavigationInstruction | null) => void;
  setCurrentIntervalIndex: (index: number) => void;
  refs: {
    nextTurnCoordinate: RefObject<Coordinate | null>;
    currentIntervalIndex: RefObject<number>;
    instructionList: RefObject<NavigationInstruction[]>;
    pathDataListByInterval: RefObject<IntervalPathData[]>;
    currentTtsUrl: RefObject<string | null>;
    previewInstructionText: RefObject<string>;
    previewTtsUrl: RefObject<string | null>;
    previewSign: RefObject<number | null>;
    isEnteredRef: RefObject<boolean>;
    passCountRef: RefObject<number>;
    lastDistanceFromMyPosToNextTurnPosRef: RefObject<number | null>;
    prevMyPositionForTurnRef: RefObject<Coordinate | null>;
    prevTimestampForTurnRef: RefObject<number | null>;
    previewEnterCount: RefObject<number>;
    currentLocationMetaData: RefObject<LocationMetaData | null>;
  };
}

export const useTurnController = ({
  isNavigationMode,
  isNavigationInitialized,
  locationMetaData,
  currentInstruction,
  setCurrentInstruction,
  setCurrentIntervalIndex,
  refs,
}: UseTurnControllerParams) => {
  const {
    ENTRY_RADIUS_METER,
    EXIT_RADIUS_METER,
    DEADZONE_DISTANCE_METER,
    MIN_EFFECTIVE_MOVE_METER,
    DOT_DEADZONE: _DOT_DEADZONE,
    PASS_COUNT_DECAY,
    PASS_COUNT_MAX,
    PROGRESS_CATCHUP_SEGMENT_DISTANCE_METER,
    PROGRESS_CONFIRM_COUNT,
    PROGRESS_END_RATIO,
    PROGRESS_MIN_INTERVAL_DISTANCE_METER,
    PROGRESS_REACHED_REMAINING_METER,
    PROGRESS_SEGMENT_DISTANCE_METER,
    PROGRESS_SHORT_INTERVAL_END_RATIO,
    PROGRESS_SHORT_INTERVAL_REMAINING_METER,
    STATION_PASS_RADIUS_METER,
    WAYPOINT_PASS_RADIUS_METER,
  } = TURN_CONFIG;

  const { MAX_PHYSICAL_SPEED_MPS, PASS_CONFIRM_COUNT } = MOTION_COMMON_OPTIONS;
  const lastAdvanceTimestampRef = useRef<number | null>(null);
  const lastAdvanceWallClockRef = useRef<{
    fromIndex: number;
    nextIndex: number;
    at: number;
  } | null>(null);
  const progressCandidateIndexRef = useRef<number | null>(null);
  const progressConfirmCountRef = useRef(0);

  // 턴 진입/지나침 감지 및 지시 업데이트
  useEffect(() => {
    const currentCoord = locationMetaData?.coordinate;
    const nextTurnCoord = refs.nextTurnCoordinate.current;

    if (
      !isNavigationMode ||
      !currentCoord ||
      !nextTurnCoord ||
      !currentInstruction ||
      !isNavigationInitialized
    ) {
      return;
    }

    const nowTimestamp = locationMetaData.timestamp ?? Date.now();

    const resetTurnState = () => {
      refs.isEnteredRef.current = false;
      refs.passCountRef.current = 0;
      refs.lastDistanceFromMyPosToNextTurnPosRef.current = null;
    };

    const resetProgressCandidate = () => {
      progressCandidateIndexRef.current = null;
      progressConfirmCountRef.current = 0;
    };

    const advanceToNextInstruction = (reason: string) => {
      const currentIndex = refs.currentIntervalIndex.current;
      const nextIndex = currentIndex + 1;
      const instructionList = refs.instructionList.current;
      const lastAdvance = lastAdvanceWallClockRef.current;
      const wallClockNow = Date.now();

      if (nextIndex >= instructionList.length) return false;
      if (lastAdvanceTimestampRef.current === nowTimestamp) return false;
      if (
        lastAdvance?.fromIndex === currentIndex &&
        lastAdvance.nextIndex === nextIndex &&
        wallClockNow - lastAdvance.at < 800
      ) {
        return false;
      }

      const nextInstruction = instructionList[nextIndex];
      const afterNextInstruction = instructionList[nextIndex + 1];
      lastAdvanceTimestampRef.current = nowTimestamp;
      lastAdvanceWallClockRef.current = {
        fromIndex: currentIndex,
        nextIndex,
        at: wallClockNow,
      };

      if (__DEV__) {
        writeNavigationQaLog('turn:advance', {
          fromIndex: currentIndex,
          toIndex: nextIndex,
          nextText: nextInstruction.text,
          afterNextText: afterNextInstruction?.text ?? null,
          reason,
        });
      }

      setCurrentInstruction(nextInstruction);
      refs.nextTurnCoordinate.current = nextInstruction.nextTurnCoordinate;
      refs.currentIntervalIndex.current = nextIndex;
      setCurrentIntervalIndex(nextIndex);
      refs.currentTtsUrl.current = nextInstruction.ttsUrl;

      refs.previewInstructionText.current = afterNextInstruction?.text ?? '';
      refs.previewTtsUrl.current = afterNextInstruction?.ttsUrl ?? null;
      refs.previewSign.current = afterNextInstruction?.sign ?? null;
      refs.previewEnterCount.current = 0;

      resetTurnState();
      resetProgressCandidate();
      refs.prevMyPositionForTurnRef.current = currentCoord;
      refs.prevTimestampForTurnRef.current = nowTimestamp;
      return true;
    };

    // 1) 정확도 체크
    const currentAccuracy = refs.currentLocationMetaData.current?.accuracy;
    if (typeof currentAccuracy === 'number' && currentAccuracy > ACCURACY_OK) {
      return;
    }

    // 2) 턴까지 거리
    const distanceToNextTurnMeter = getDistanceBetweenCoords(
      currentCoord,
      nextTurnCoord,
    );

    const hasReachedCurrentIntervalEnd = () => {
      const currentIndex = refs.currentIntervalIndex.current;
      const pathDataListByInterval = refs.pathDataListByInterval.current;
      const currentIntervalPath =
        pathDataListByInterval[currentIndex]?.coordinateList ?? [];
      const currentText =
        refs.instructionList.current[currentIndex]?.text ??
        currentInstruction.text;
      const currentDistanceMeter =
        refs.instructionList.current[currentIndex]?.distance ?? 0;

      if (currentIndex >= refs.instructionList.current.length - 1) {
        return false;
      }

      const isStationOrWaypointInstruction =
        currentText.includes('대여소') || currentText.includes('경유지');
      const isWaypointInstruction = currentText.includes('경유지');
      const isArriveStationInstruction = currentText.includes('도착 대여소');
      const milestonePassRadiusMeter = isWaypointInstruction
        ? WAYPOINT_PASS_RADIUS_METER
        : STATION_PASS_RADIUS_METER;

      if (isArriveStationInstruction) {
        return false;
      }

      if (
        isStationOrWaypointInstruction &&
        distanceToNextTurnMeter <= milestonePassRadiusMeter
      ) {
        return true;
      }

      if (currentIntervalPath.length < 2) {
        return false;
      }

      const isShortInterval =
        currentDistanceMeter > 0 &&
        currentDistanceMeter < PROGRESS_MIN_INTERVAL_DISTANCE_METER;
      const reachedRemainingMeter = isShortInterval
        ? PROGRESS_SHORT_INTERVAL_REMAINING_METER
        : PROGRESS_REACHED_REMAINING_METER;
      const reachedEndRatio = isShortInterval
        ? PROGRESS_SHORT_INTERVAL_END_RATIO
        : PROGRESS_END_RATIO;
      const projection = findClosestSegmentProjection(
        currentCoord,
        currentIntervalPath,
      );
      const remainingDistanceMeter = calculateIntervalDistanceByMyPosition(
        currentCoord,
        pathDataListByInterval,
        currentIndex,
        'remaining',
      );
      const lastSegmentStartIndex = Math.max(0, currentIntervalPath.length - 2);
      const isNearCurrentInterval =
        projection.distanceMeter <= PROGRESS_SEGMENT_DISTANCE_METER;
      const isCloseEnoughForCatchup =
        projection.distanceMeter <= PROGRESS_CATCHUP_SEGMENT_DISTANCE_METER;
      const isAtIntervalTail =
        projection.closestIdx >= lastSegmentStartIndex &&
        projection.projectionRatio >= reachedEndRatio;

      if (!isCloseEnoughForCatchup) return false;

      return isShortInterval
        ? isAtIntervalTail || remainingDistanceMeter <= reachedRemainingMeter
        : isNearCurrentInterval &&
            (remainingDistanceMeter <= reachedRemainingMeter ||
              isAtIntervalTail);
    };

    if (hasReachedCurrentIntervalEnd()) {
      const currentIndex = refs.currentIntervalIndex.current;
      progressConfirmCountRef.current =
        progressCandidateIndexRef.current === currentIndex
          ? progressConfirmCountRef.current + 1
          : 1;
      progressCandidateIndexRef.current = currentIndex;

      if (progressConfirmCountRef.current >= PROGRESS_CONFIRM_COUNT) {
        advanceToNextInstruction('interval-progress');
        return;
      }
    } else {
      resetProgressCandidate();
    }

    // 3) 진입: 통과 판정은 진입 후 위치 변화로만 판단한다.
    if (
      !refs.isEnteredRef.current &&
      distanceToNextTurnMeter <= ENTRY_RADIUS_METER
    ) {
      refs.isEnteredRef.current = true;
      refs.passCountRef.current = 0;
      refs.lastDistanceFromMyPosToNextTurnPosRef.current =
        distanceToNextTurnMeter;
      refs.prevMyPositionForTurnRef.current = currentCoord;
      refs.prevTimestampForTurnRef.current = nowTimestamp;
      refs.previewEnterCount.current += 1;
      return;
    }

    // entry 아니면 passed 판정 자체 안 함
    if (!refs.isEnteredRef.current) {
      const prevDistanceMeter =
        refs.lastDistanceFromMyPosToNextTurnPosRef.current;
      const prevPosition = refs.prevMyPositionForTurnRef.current;
      const prevTimestamp = refs.prevTimestampForTurnRef.current;

      if (prevDistanceMeter != null && prevPosition && prevTimestamp != null) {
        const deltaDistanceMeter = distanceToNextTurnMeter - prevDistanceMeter;
        const dtSec = (nowTimestamp - prevTimestamp) / 1000;
        const { moveMag, speedMps, dot } = calculateMotionVector(
          prevPosition,
          currentCoord,
          nextTurnCoord,
          dtSec,
        );
        const hasMissedEntryWhilePassing =
          prevDistanceMeter <= EXIT_RADIUS_METER &&
          distanceToNextTurnMeter > ENTRY_RADIUS_METER &&
          deltaDistanceMeter > DEADZONE_DISTANCE_METER &&
          moveMag >= MIN_EFFECTIVE_MOVE_METER &&
          speedMps <= MAX_PHYSICAL_SPEED_MPS &&
          dot < _DOT_DEADZONE;

        if (hasMissedEntryWhilePassing) {
          advanceToNextInstruction('missed-entry');
          return;
        }
      }

      refs.prevMyPositionForTurnRef.current = currentCoord;
      refs.prevTimestampForTurnRef.current = nowTimestamp;
      refs.lastDistanceFromMyPosToNextTurnPosRef.current =
        distanceToNextTurnMeter;
      return;
    }

    // =========================
    // 4) 거리 증가 추세 (멀어지기 시작, isEntering 이후부터 측정)
    // =========================
    const prevDistanceMeter =
      refs.lastDistanceFromMyPosToNextTurnPosRef.current;
    refs.lastDistanceFromMyPosToNextTurnPosRef.current =
      distanceToNextTurnMeter;

    if (prevDistanceMeter == null) {
      refs.prevMyPositionForTurnRef.current = currentCoord;
      refs.prevTimestampForTurnRef.current = nowTimestamp;
      return;
    }

    const deltaDistanceMeter = distanceToNextTurnMeter - prevDistanceMeter;
    const isGettingFarther = deltaDistanceMeter > DEADZONE_DISTANCE_METER;

    // 5) 벡터/내적 + 속도 게이트
    const prevPosition = refs.prevMyPositionForTurnRef.current;
    const prevTimestamp = refs.prevTimestampForTurnRef.current;

    // prev 갱신은 여기서 한번만
    refs.prevMyPositionForTurnRef.current = currentCoord;
    refs.prevTimestampForTurnRef.current = nowTimestamp;

    if (!prevPosition || prevTimestamp == null) return;

    const dtSec = (nowTimestamp - prevTimestamp) / 1000;
    const {
      moveMag,
      speedMps,
      dot: _dot,
    } = calculateMotionVector(prevPosition, currentCoord, nextTurnCoord, dtSec);

    // GPS 점프 컷오프
    if (speedMps > MAX_PHYSICAL_SPEED_MPS) {
      refs.passCountRef.current = Math.max(
        0,
        refs.passCountRef.current - PASS_COUNT_DECAY,
      );
      return;
    }

    // 이동이 너무 작으면 방향 판정 의미 없음
    if (moveMag < MIN_EFFECTIVE_MOVE_METER) {
      refs.passCountRef.current = Math.max(
        0,
        refs.passCountRef.current - PASS_COUNT_DECAY,
      );
      return;
    }

    // dot < 0 => 턴포인트를 등지고 움직임(멀어지는 방향)
    // const isMovingAwayFromTurn = _dot < _DOT_DEADZONE;

    // 6) passed 카운트 (벡터 방향 판단 미사용 — 거리 증가 여부만으로 판단)
    const isPassedCandidate = isGettingFarther; // && isMovingAwayFromTurn;

    if (!isPassedCandidate) {
      refs.passCountRef.current = Math.max(
        0,
        refs.passCountRef.current - PASS_COUNT_DECAY,
      );
      return;
    }
    // 위치 갱신 간격이 길면 PASS_CONFIRM_COUNT를 채우기 전에 EXIT 반경 밖으로 나갈 수 있다.
    // 이미 멀어지는 중이고 EXIT 밖이라면 실제 턴 포인트를 지난 것으로 본다.
    refs.passCountRef.current = Math.min(
      PASS_COUNT_MAX,
      distanceToNextTurnMeter >= EXIT_RADIUS_METER
        ? PASS_CONFIRM_COUNT
        : refs.passCountRef.current + 1,
    );

    // 7) 통과 확정 → 다음 instruction
    if (refs.passCountRef.current < PASS_CONFIRM_COUNT) return;

    advanceToNextInstruction('turn-pass');
  }, [
    locationMetaData?.coordinate,
    isNavigationMode,
    currentInstruction,
    isNavigationInitialized,
    setCurrentIntervalIndex,
  ]);
};
