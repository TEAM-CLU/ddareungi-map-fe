import { useEffect, type RefObject } from 'react';
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
import { Coordinates } from '@/features/map/model/map.types';
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

export type UseNavigationMetricsParams = {
  isNavigationMode: boolean;
  isNavigationInitialized: boolean;
  locationMetaData: LocationMetaData | null;
  locationTick: number | undefined;
  userGender: Gender;
  traveledDistanceMeter: number | undefined | null;
  remainingDistanceMeter: number | undefined | null;
  setTraveledDistance: (v: number) => void;
  setRemainingDistance: (v: number) => void;
  setEta: (v: Date | undefined | null) => void;
  addCaloriesBurned: (v: number) => void;
  addCarbonSaved: (v: number) => void;
  refs: {
    pathDataListByInterval: RefObject<IntervalPathData[]>;
    instructionList: RefObject<NavigationInstruction[]>;
    currentIntervalIndex: RefObject<number>;
    prevTimestampForDistanceRef: RefObject<number | null>;
    prevMyPositionForDistanceRef: RefObject<Coordinates | null>;
    prevTraveledDistanceMeterRef: RefObject<number>;
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
  traveledDistanceMeter,
  remainingDistanceMeter,
  setTraveledDistance,
  setRemainingDistance,
  setEta,
  addCaloriesBurned,
  addCarbonSaved,
  refs,
}: UseNavigationMetricsParams) => {
  const { STOP_JUDGE_MOVE_METER } = TRAVELED_DISTANCE_OPTIONS;
  const { BIKING_STATE_THRESHOLD } = TRANSPORT_STATE_CONFIG;

  // 소요거리/남은거리 업데이트
  useEffect(() => {
    if (
      refs.pathDataListByInterval.current.length === 0 ||
      refs.instructionList.current.length === 0 ||
      !isNavigationInitialized
    )
      return;

    if (!isNavigationMode || !locationMetaData?.coordinate || !locationMetaData)
      return;

    const myPosition = locationMetaData.coordinate;
    const currentTimestamp =
      typeof locationMetaData.timestamp === 'number'
        ? locationMetaData.timestamp
        : Date.now();

    const prevMyPositionForDistance = refs.prevMyPositionForDistanceRef.current;
    const prevTimestampForDistance = refs.prevTimestampForDistanceRef.current;

    // 첫 샘플(초기값) 처리: prevPos/prevTs가 없으면 "prev 세팅"부터 하고 종료
    if (
      prevMyPositionForDistance === null ||
      prevTimestampForDistance === null
    ) {
      // traveled (첫 값은 증가/감소 안정화보단 "기준값 세팅" 의미)
      const firstTraveledDistanceMeter = calculateTraveledDistance(
        myPosition,
        refs.pathDataListByInterval.current,
        refs.currentIntervalIndex.current,
        refs.instructionList.current,

        refs.prevTraveledDistanceMeterRef.current, // 0 (reset on reroute)
        null,
        null,
        currentTimestamp,
      );

      // remaining (첫 값도 기준값 세팅)
      const firstRemainingDistanceMeter = calculateRemainingDistance(
        myPosition,
        refs.pathDataListByInterval.current,
        refs.currentIntervalIndex.current,
        refs.instructionList.current,

        refs.prevRemainingDistanceMeterRef.current, //  0
        null,
        null,
        currentTimestamp,
      );

      const finalFirstTraveledDistanceMeter =
        firstTraveledDistanceMeter + refs.accumulatedTraveledDistanceRef.current;

      setTraveledDistance(finalFirstTraveledDistanceMeter);
      setRemainingDistance(firstRemainingDistanceMeter);

      // 다음 tick부터 stabilize가 제대로 먹도록 prev 갱신
      refs.prevTraveledDistanceMeterRef.current =
        finalFirstTraveledDistanceMeter;
      refs.prevRemainingDistanceMeterRef.current = firstRemainingDistanceMeter;

      refs.prevMyPositionForDistanceRef.current = myPosition;
      refs.prevTimestampForDistanceRef.current = currentTimestamp;
      return;
    }

    // traveled 계산 (내부에서 stabilizeDistance까지 끝남)
    const nextTraveledDistanceMeter = calculateTraveledDistance(
      myPosition,
      refs.pathDataListByInterval.current,
      refs.currentIntervalIndex.current,
      refs.instructionList.current,

      refs.prevTraveledDistanceMeterRef.current,
      prevMyPositionForDistance,
      prevTimestampForDistance,
      currentTimestamp,
    );

    // 누적 소요거리 더하기 (재탐색 시 이전 거리 유지)
    const finalTraveledDistanceMeter =
      nextTraveledDistanceMeter + refs.accumulatedTraveledDistanceRef.current;

    // remaining 계산 (내부에서 stabilizeDistance까지 끝남)
    const nextRemainingDistanceMeter = calculateRemainingDistance(
      myPosition,
      refs.pathDataListByInterval.current,
      refs.currentIntervalIndex.current,
      refs.instructionList.current,

      refs.prevRemainingDistanceMeterRef.current,
      prevMyPositionForDistance,
      prevTimestampForDistance,
      currentTimestamp,
    );

    setTraveledDistance(finalTraveledDistanceMeter);
    setRemainingDistance(nextRemainingDistanceMeter);

    // prevDistance는 각각 갱신 (단조성 기준)
    refs.prevTraveledDistanceMeterRef.current = finalTraveledDistanceMeter;
    refs.prevRemainingDistanceMeterRef.current = nextRemainingDistanceMeter;

    // 공통 prevPos/prevTs 갱신 (속도/정지/점프 판정 기준)
    refs.prevMyPositionForDistanceRef.current = myPosition;
    refs.prevTimestampForDistanceRef.current = currentTimestamp;
  }, [
    locationMetaData?.coordinate,
    locationTick,
    isNavigationMode,
    isNavigationInitialized,
  ]);

  // eta 업데이트
  useEffect(() => {
    if (
      refs.prevLocationMetaData.current === null ||
      refs.currentLocationMetaData.current === null ||
      !isNavigationInitialized
    )
      return;

    if (!remainingDistanceMeter) return;
    if (!isNavigationMode || !locationMetaData?.coordinate || !locationMetaData)
      return;

    // eta 계산
    // 1) 정확하고 보정된 속도 사용
    const accurateSpeedMps = returnAccurateSpeed(
      refs.prevLocationMetaData.current,
      refs.currentLocationMetaData.current,
    );
    refs.prevEmaSpeedMps.current = accurateSpeedMps;

    // 2) 남은 거리 / 속도 = 남은 시간
    setEta(calculateEta(remainingDistanceMeter, accurateSpeedMps));
  }, [
    locationMetaData?.coordinate,
    locationTick,
    remainingDistanceMeter,
    isNavigationMode,
    isNavigationInitialized,
  ]);

  // 칼로리, 탄소 저감 측정
  useEffect(() => {
    if (
      !isNavigationMode ||
      traveledDistanceMeter == null ||
      !locationMetaData ||
      !isNavigationInitialized
    )
      return;

    // 첫 샘플 세팅
    if (refs.prevTraveledDistanceForMeasureRef.current === null) {
      refs.prevTraveledDistanceForMeasureRef.current = traveledDistanceMeter;
      return;
    }

    const prevTraveledDistanceForMeasure =
      refs.prevTraveledDistanceForMeasureRef.current;
    const deltaDistanceMeter =
      traveledDistanceMeter - prevTraveledDistanceForMeasure;

    // 다음 tick 준비
    refs.prevTraveledDistanceForMeasureRef.current = traveledDistanceMeter;
    const safeDeltaDistanceMeter = Math.max(0, deltaDistanceMeter);

    if (safeDeltaDistanceMeter <= STOP_JUDGE_MOVE_METER) return;

    // 시간 delta는 timestamp로
    const currentTimestamp =
      typeof locationMetaData.timestamp === 'number'
        ? locationMetaData.timestamp
        : Date.now();

    const prevTimestampForMeasure = refs.prevTimestampForMeasureRef.current;
    if (prevTimestampForMeasure == null) {
      refs.prevTimestampForMeasureRef.current = currentTimestamp;
      return;
    }

    const rawDtSec = Math.max(
      0.001,
      (currentTimestamp - prevTimestampForMeasure) / 1000,
    );

    const dtSec = Math.min(rawDtSec, MOTION_COMMON_OPTIONS.DT_SEC_CAP);

    refs.prevTimestampForMeasureRef.current = currentTimestamp;

    const currentSpeedMps = safeDeltaDistanceMeter / dtSec;

    // 말도 안 되는 speed는 컷
    if (currentSpeedMps > MOTION_COMMON_OPTIONS.MAX_PHYSICAL_SPEED_MPS) return;

    const transportationType = classifyTransportBySpeed(currentSpeedMps);

    // 정지 상태 추적: 이동 거리가 매우 작으면 정지로 판단
    // NOTE: 정지 판정 로직은 이제 별도 useEffect에서 처리합니다.

    // 주행 상태 추적: 지속적으로 biking으로 판정되면 주행 상태로 간주
    if (transportationType === 'biking') {
      refs.bikingStateCountRef.current += 1;
      if (refs.bikingStateCountRef.current >= BIKING_STATE_THRESHOLD) {
        refs.isBikingStateRef.current = true;
      }
    } else {
      refs.bikingStateCountRef.current = Math.max(
        0,
        refs.bikingStateCountRef.current - 1,
      );
      if (refs.bikingStateCountRef.current === 0) {
        refs.isBikingStateRef.current = false;
      }
    }

    const currentCaloriesDelta = measureCaloriesBurned(
      transportationType,
      userGender,
      dtSec,
    );

    const currentCarbonDelta = measureCarbonSaved(
      transportationType,
      safeDeltaDistanceMeter,
    );

    addCaloriesBurned(currentCaloriesDelta);
    addCarbonSaved(currentCarbonDelta);
  }, [
    isNavigationMode,
    traveledDistanceMeter,
    locationTick,
    userGender,
    isNavigationInitialized,
  ]);
};
