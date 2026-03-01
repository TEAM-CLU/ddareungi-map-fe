import { useEffect, useRef, type RefObject } from 'react';
import {
  MOTION_COMMON_OPTIONS,
  TRAVELED_DISTANCE_OPTIONS,
  TRANSPORT_STATE_CONFIG,
} from '@/features/navigation/model/navigation.constants';
import {
  IntervalPathData,
  LocationMetaData,
  NavigationInstruction,
} from '@/features/navigation/model/navigation.types';
import { Coordinate } from '@/shared/model/shared.types';
import {
  calculateEta,
  calculateRemainingDistance,
  calculateTraveledDistance,
  returnAccurateSpeed,
} from '@/features/navigation/utils/navigationController';
import { classifyTransportBySpeed } from '@/features/navigation/utils/classifyTransportBySpeed';
import {
  measureCaloriesBurned,
  measureCarbonSaved,
} from '@/shared/utils/measure';
import { Gender } from '@/shared/model/shared.types';
import { handleCatch } from '@/shared/utils/errorHandler';

export type UseNavigationMetricsParams = {
  isNavigationMode: boolean;
  isNavigationInitialized: boolean;
  locationMetaData: LocationMetaData | null;
  locationTick: number | undefined;
  userGender: Gender;
  userBirthYear: string | undefined | null;
  traveledDistanceMeter: number | undefined | null;
  remainingDistanceMeter: number | undefined | null;
  setTraveledDistance: (v: number) => void;
  setRemainingDistance: (v: number) => void;
  setEta: (v: Date | undefined | null) => void;
  addCaloriesBurned: (v: number) => void;
  addCarbonSaved: (v: number) => void;
  onError?: () => void;
  refs: {
    pathDataListByInterval: RefObject<IntervalPathData[]>;
    instructionList: RefObject<NavigationInstruction[]>;
    currentIntervalIndex: RefObject<number>;
    prevTimestampForDistanceRef: RefObject<number | null>;
    prevMyPositionForDistanceRef: RefObject<Coordinate | null>;
    prevTraveledDistanceMeterRef: RefObject<number>;
    routeTraveledBaselineRef: RefObject<number | null>;
    prevRemainingDistanceMeterRef: RefObject<number>;
    accumulatedTraveledDistanceRef: RefObject<number>;
    prevLocationMetaData: RefObject<LocationMetaData | null>;
    currentLocationMetaData: RefObject<LocationMetaData | null>;
    prevEmaSpeedMps: RefObject<number | null>;
    prevTimestampForMeasureRef: RefObject<number | null>;
    prevTraveledDistanceForMeasureRef: RefObject<number | null>;
    isBikingStateRef: RefObject<boolean>;
    bikingStateCountRef: RefObject<number>;
  };
};

export const useNavigationMetrics = ({
  isNavigationMode,
  isNavigationInitialized,
  locationMetaData,
  locationTick,
  userGender,
  userBirthYear,
  traveledDistanceMeter,
  remainingDistanceMeter,
  setTraveledDistance,
  setRemainingDistance,
  setEta,
  addCaloriesBurned,
  addCarbonSaved,
  onError,
  refs,
}: UseNavigationMetricsParams) => {
  const { STOP_JUDGE_MOVE_METER } = TRAVELED_DISTANCE_OPTIONS;
  const { BIKING_STATE_THRESHOLD } = TRANSPORT_STATE_CONFIG;
  const { BACKGROUND_RESUME_RESET_GAP_SEC } = MOTION_COMMON_OPTIONS;
  const skippedEtaTickTimestampRef = useRef<number | null>(null);

  // 1. 소요거리(Traveled) / 남은거리(Remaining) 업데이트
  useEffect(() => {
    const currentCoord = locationMetaData?.coordinate;
    const pathData = refs.pathDataListByInterval.current;
    const instructions = refs.instructionList.current;

    if (
      !isNavigationMode ||
      !isNavigationInitialized ||
      !locationMetaData ||
      !currentCoord ||
      pathData.length === 0 ||
      instructions.length === 0
    ) {
      return;
    }

    const currentTimestamp = locationMetaData.timestamp ?? Date.now();
    const prevPosisionForDistance = refs.prevMyPositionForDistanceRef.current; // null이면 첫 진입
    const prevTimestampForDistance = refs.prevTimestampForDistanceRef.current;
    const resumeGapSec =
      prevTimestampForDistance !== null
        ? (currentTimestamp - prevTimestampForDistance) / 1000
        : null;
    const resumedFromBackground =
      resumeGapSec !== null && resumeGapSec > BACKGROUND_RESUME_RESET_GAP_SEC;

    try {
      if (resumedFromBackground) {
        // 백그라운드 복귀 첫 틱은 속도 기반 필터를 건너뛰고 기준점만 재설정
        const resumedLocalTraveledDistanceMeter = calculateTraveledDistance(
          currentCoord,
          pathData,
          refs.currentIntervalIndex.current,
          instructions,
          refs.prevTraveledDistanceMeterRef.current,
          null,
          null,
          currentTimestamp,
        );
        if (refs.routeTraveledBaselineRef.current === null) {
          refs.routeTraveledBaselineRef.current =
            resumedLocalTraveledDistanceMeter;
        }
        const normalizedLocalTraveledDistanceMeter = Math.max(
          0,
          resumedLocalTraveledDistanceMeter - refs.routeTraveledBaselineRef.current,
        );
        const resumedRemainingDistanceMeter = calculateRemainingDistance(
          currentCoord,
          pathData,
          refs.currentIntervalIndex.current,
          instructions,
          refs.prevRemainingDistanceMeterRef.current,
          null,
          null,
          currentTimestamp,
        );
        const finalTraveledDistanceMeter =
          normalizedLocalTraveledDistanceMeter +
          refs.accumulatedTraveledDistanceRef.current;

        setTraveledDistance(finalTraveledDistanceMeter);
        setRemainingDistance(resumedRemainingDistanceMeter);

        refs.prevTraveledDistanceMeterRef.current =
          resumedLocalTraveledDistanceMeter;
        refs.prevRemainingDistanceMeterRef.current = resumedRemainingDistanceMeter;
        refs.prevMyPositionForDistanceRef.current = currentCoord;
        refs.prevTimestampForDistanceRef.current = currentTimestamp;

        // 칼로리/ETA 관련 기준도 함께 초기화
        refs.prevTimestampForMeasureRef.current = null;
        refs.prevTraveledDistanceForMeasureRef.current = null;
        refs.prevLocationMetaData.current = null;
        refs.currentLocationMetaData.current = locationMetaData;
        refs.prevEmaSpeedMps.current = null;
        skippedEtaTickTimestampRef.current = currentTimestamp;
        return;
      }

      // 이동 거리 계산
      const calculatedLocalTraveledDistanceMeter = calculateTraveledDistance(
        currentCoord,
        pathData,
        refs.currentIntervalIndex.current,
        instructions,
        refs.prevTraveledDistanceMeterRef.current,
        prevPosisionForDistance,
        prevTimestampForDistance,
        currentTimestamp,
      );
      if (refs.routeTraveledBaselineRef.current === null) {
        refs.routeTraveledBaselineRef.current =
          calculatedLocalTraveledDistanceMeter;
      }
      const normalizedLocalTraveledDistanceMeter = Math.max(
        0,
        calculatedLocalTraveledDistanceMeter - refs.routeTraveledBaselineRef.current,
      );

      // 남은 거리 계산
      const calculatedRemainigDistanceMeter = calculateRemainingDistance(
        currentCoord,
        pathData,
        refs.currentIntervalIndex.current,
        instructions,
        refs.prevRemainingDistanceMeterRef.current,
        prevPosisionForDistance,
        prevTimestampForDistance,
        currentTimestamp,
      );

      // 재탐색 등을 고려한 누적 거리 합산
      const finalTraveledDistanceMeter =
        normalizedLocalTraveledDistanceMeter +
        refs.accumulatedTraveledDistanceRef.current;

      setTraveledDistance(finalTraveledDistanceMeter);
      setRemainingDistance(calculatedRemainigDistanceMeter);

      // Refs 갱신 (다음 틱 계산을 위해)
      refs.prevTraveledDistanceMeterRef.current =
        calculatedLocalTraveledDistanceMeter;
      refs.prevRemainingDistanceMeterRef.current =
        calculatedRemainigDistanceMeter;
      refs.prevMyPositionForDistanceRef.current = currentCoord;
      refs.prevTimestampForDistanceRef.current = currentTimestamp;
    } catch (error) {
      // undefined로 인한 크래시 방지: 네비게이션 안전 종료
      handleCatch(error, {
        mode: 'terminateNavigation',
        onTerminate: () => onError?.(),
        title: '네비게이션 종료',
        message: '거리 계산 오류로 인해 네비게이션을 종료합니다.',
      });
      return;
    }
  }, [
    locationMetaData?.coordinate,
    locationTick,
    isNavigationMode,
    isNavigationInitialized,
    setTraveledDistance,
    setRemainingDistance,
  ]);

  // 2. ETA(도착 예정 시간) 업데이트
  useEffect(() => {
    const currentTimestamp = locationMetaData?.timestamp ?? null;
    if (
      currentTimestamp !== null &&
      skippedEtaTickTimestampRef.current === currentTimestamp
    ) {
      skippedEtaTickTimestampRef.current = null;
      return;
    }

    if (
      !isNavigationMode ||
      !isNavigationInitialized ||
      !remainingDistanceMeter ||
      !locationMetaData?.coordinate ||
      !refs.prevLocationMetaData.current ||
      !refs.currentLocationMetaData.current
    ) {
      return;
    }

    // 정확하고 보정된 속도 사용
    const accurateSpeedMps = returnAccurateSpeed(
      refs.prevLocationMetaData.current,
      refs.currentLocationMetaData.current,
      refs.prevEmaSpeedMps.current ?? undefined,
    );
    refs.prevEmaSpeedMps.current = accurateSpeedMps;

    // ETA 계산 및 적용
    const etaDate = calculateEta(remainingDistanceMeter, accurateSpeedMps);
    setEta(etaDate);
  }, [
    locationTick, // 위치 갱신 틱에 맞춰 실행
    remainingDistanceMeter,
    isNavigationMode,
    isNavigationInitialized,
    setEta,
  ]);

  // 3. 칼로리, 탄소 저감 측정
  useEffect(() => {
    if (
      !isNavigationMode ||
      !isNavigationInitialized ||
      !locationMetaData ||
      traveledDistanceMeter == null
    ) {
      return;
    }

    // 초기화: 이전 거리가 없으면 현재 거리로 세팅하고 종료
    if (refs.prevTraveledDistanceForMeasureRef.current === null) {
      refs.prevTraveledDistanceForMeasureRef.current = traveledDistanceMeter;
      refs.prevTimestampForMeasureRef.current =
        locationMetaData.timestamp ?? Date.now();
      return;
    }

    // 거리 차이(Delta) 계산
    const prevDist = refs.prevTraveledDistanceForMeasureRef.current;
    const deltaDistanceMeter = Math.max(0, traveledDistanceMeter - prevDist);

    // Ref 갱신 (다음 계산 준비)
    refs.prevTraveledDistanceForMeasureRef.current = traveledDistanceMeter;

    // 움직임이 너무 적으면 계산 스킵 (GPS 오차 무시)
    if (deltaDistanceMeter <= STOP_JUDGE_MOVE_METER) return;

    // 시간 차이(Delta Time) 계산
    const currentTimestamp = locationMetaData.timestamp ?? Date.now();
    const prevTimestamp =
      refs.prevTimestampForMeasureRef.current ?? currentTimestamp;

    // dt가 0이거나 너무 작으면 0.001로 방어 (나눗셈 에러 방지)
    const rawDtSec = Math.max(0.001, (currentTimestamp - prevTimestamp) / 1000);
    // 틱이 튀었을 때를 대비해 최대값 캡(CAP) 적용
    const dtSec = Math.min(rawDtSec, MOTION_COMMON_OPTIONS.DT_SEC_CAP);

    refs.prevTimestampForMeasureRef.current = currentTimestamp;

    // 순간 속도 계산
    const currentSpeedMps = deltaDistanceMeter / dtSec;

    // 비정상적인 속도(GPS 튐) 무시
    if (currentSpeedMps > MOTION_COMMON_OPTIONS.MAX_PHYSICAL_SPEED_MPS) return;

    // 이동 수단 분류 (Walking vs Biking)
    const transportationType = classifyTransportBySpeed(currentSpeedMps);

    // Biking 상태 판정 (Debouncing)
    if (transportationType === 'biking') {
      refs.bikingStateCountRef.current += 1;
      if (refs.bikingStateCountRef.current >= BIKING_STATE_THRESHOLD) {
        refs.isBikingStateRef.current = true;
      }
    } else {
      // Walking이면 카운트 감소
      refs.bikingStateCountRef.current = Math.max(
        0,
        refs.bikingStateCountRef.current - 1,
      );
      if (refs.bikingStateCountRef.current === 0) {
        refs.isBikingStateRef.current = false;
      }
    }

    // 칼로리 & 탄소 계산
    const caloriesDelta = measureCaloriesBurned(
      transportationType,
      userGender,
      dtSec,
      Number(userBirthYear),
    );
    const carbonDelta = measureCarbonSaved(
      transportationType,
      deltaDistanceMeter,
    );

    // 스토어 업데이트
    if (caloriesDelta > 0) addCaloriesBurned(caloriesDelta);
    if (carbonDelta > 0) addCarbonSaved(carbonDelta);
  }, [
    isNavigationMode,
    isNavigationInitialized,
    locationTick,
    traveledDistanceMeter, // 거리가 변했을 때 실행
    userGender,
    userBirthYear,
    addCaloriesBurned,
    addCarbonSaved,
  ]);
};
