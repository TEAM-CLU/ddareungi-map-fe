import { useEffect, type RefObject } from 'react';
import { Coordinate } from '@/shared/model/shared.types';
import {
  ACCURACY_OK,
  MOTION_COMMON_OPTIONS,
  TURN_CONFIG,
} from '@/features/navigation/model/navigation.constants';
import { NavigationInstruction } from '@/features/navigation/model/navigation.types';
import { calculateMotionVector } from '@/features/navigation/utils/calculateMotionVector';
import { LocationMetaData } from '@/features/navigation/model/navigation.types';
import { getDistanceBetweenCoords } from '@/shared/utils/measure';

export type UseTurnControllerParams = {
  isNavigationMode: boolean;
  isNavigationInitialized: boolean;
  locationMetaData: LocationMetaData | null;
  currentInstruction: NavigationInstruction | null;
  setCurrentInstruction: (inst: NavigationInstruction | null) => void;
  refs: {
    nextTurnCoordinate: RefObject<Coordinate | null>;
    currentIntervalIndex: RefObject<number>;
    instructionList: RefObject<NavigationInstruction[]>;
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
};

export const useTurnController = ({
  isNavigationMode,
  isNavigationInitialized,
  locationMetaData,
  currentInstruction,
  setCurrentInstruction,
  refs,
}: UseTurnControllerParams) => {
  const {
    ENTRY_RADIUS_METER,
    EXIT_RADIUS_METER,
    DEADZONE_DISTANCE_METER,
    MIN_EFFECTIVE_MOVE_METER,
    DOT_DEADZONE,
    PASS_COUNT_DECAY,
    PASS_COUNT_MAX,
  } = TURN_CONFIG;

  const { MAX_PHYSICAL_SPEED_MPS, PASS_CONFIRM_COUNT } = MOTION_COMMON_OPTIONS;

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

    const resetTurnState = () => {
      refs.isEnteredRef.current = false;
      refs.passCountRef.current = 0;
      refs.lastDistanceFromMyPosToNextTurnPosRef.current = null;
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

    const nowTimestamp = Date.now();

    // 3) entry / exit
    // 3-1) 진입
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

    // 3-2) 이탈
    if (
      refs.isEnteredRef.current &&
      distanceToNextTurnMeter >= EXIT_RADIUS_METER
    ) {
      resetTurnState();
      refs.prevMyPositionForTurnRef.current = currentCoord;
      refs.prevTimestampForTurnRef.current = nowTimestamp;
      return;
    }

    // entry 아니면 passed 판정 자체 안 함
    if (!refs.isEnteredRef.current) {
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
    const { moveMag, speedMps, dot } = calculateMotionVector(
      prevPosition,
      currentCoord,
      nextTurnCoord,
      dtSec,
    );

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
    const isMovingAwayFromTurn = dot < DOT_DEADZONE;

    // 6) passed 카운트
    const isPassedCandidate = isGettingFarther && isMovingAwayFromTurn;

    if (!isPassedCandidate) {
      refs.passCountRef.current = Math.max(
        0,
        refs.passCountRef.current - PASS_COUNT_DECAY,
      );
      return;
    }
    refs.passCountRef.current = Math.min(
      PASS_COUNT_MAX,
      refs.passCountRef.current + 1,
    );

    // 7) 통과 확정 → 다음 instruction
    if (refs.passCountRef.current < PASS_CONFIRM_COUNT) return;

    const nextIndex = refs.currentIntervalIndex.current + 1;
    const instructionList = refs.instructionList.current;

    if (nextIndex >= instructionList.length) return;

    const nextInstruction = instructionList[nextIndex];
    const afterNextInstruction = instructionList[nextIndex + 1];

    setCurrentInstruction(nextInstruction);
    refs.nextTurnCoordinate.current = nextInstruction.nextTurnCoordinate;
    refs.currentIntervalIndex.current = nextIndex;
    refs.currentTtsUrl.current = nextInstruction.ttsUrl;

    refs.previewInstructionText.current = afterNextInstruction?.text ?? '';
    refs.previewTtsUrl.current = afterNextInstruction?.ttsUrl ?? null;
    refs.previewSign.current = afterNextInstruction?.sign ?? null;
    refs.previewEnterCount.current = 0;

    resetTurnState();
    refs.prevMyPositionForTurnRef.current = currentCoord;
    refs.prevTimestampForTurnRef.current = Date.now();
  }, [
    locationMetaData?.coordinate,
    isNavigationMode,
    currentInstruction,
    isNavigationInitialized,
  ]);
};
