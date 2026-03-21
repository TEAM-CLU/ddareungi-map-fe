import { useEffect, useRef } from 'react';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { useMeasurementStore } from '../stores/useMeasurementStore';
import { useUserInfoQuery } from '@/features/auth/services/user.queries';
import { MEASUREMENT_METRICS_CONFIG } from '../model/measurement.constants';
import {
  getDistanceBetweenCoords,
  measureCaloriesBurned,
} from '@/shared/utils/measure';
import {
  calculateFreeTraveledDistanceMeter,
  calculateSpeedMps,
  speedMpsToKmh,
  paceMinPerKmFromSpeedKmh,
  clampSpeedKmh,
} from '../utils/measurementDistanceUtils';

export function useMeasurementMetrics(): void {
  const locationMetaData = useMyPositionStore(s => s.locationMetaData);
  const locationTick = locationMetaData?.timestamp;

  const { phase, isPaused, setMetrics } = useMeasurementStore();
  const accumulatedCaloriesRef = useRef(0);

  const { data: userInfo } = useUserInfoQuery();
  const userGender = userInfo?.data?.gender ?? undefined;
  const userBirthYear = userInfo?.data?.birthYear ?? null;

  const prevMetaRef = useRef<typeof locationMetaData | null>(null);
  const prevPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const prevTraveledRef = useRef(0);
  const prevTimeMsRef = useRef<number | null>(null);
  const prevEmaMpsRef = useRef<number | null>(null);
  const prevCalorieTimeRef = useRef<number | null>(null);
  const prevCalorieTraveledRef = useRef<number | null>(null);
  const speedHistoryRef = useRef<number[]>([]);
  const maxSpeedKmhRef = useRef(0);
  const startupMoveConfirmStreakRef = useRef(0);
  const hasStartedMovingRef = useRef(false);
  const prevPhasePausedStateRef = useRef<{
    phase: typeof phase;
    isPaused: boolean;
  } | null>(null);

  const isMeasuring =
    phase === 'measuring' && !isPaused && locationMetaData?.coordinate;

  useEffect(() => {
    if (!isMeasuring || !locationMetaData?.coordinate) return;

    const coord = locationMetaData.coordinate;
    const ts = locationMetaData.timestamp ?? Date.now();
    const prevPos = prevPosRef.current;
    const prevMeta = prevMetaRef.current;
    const prevTimestamp = prevTimeMsRef.current;

    const resumeGapSec =
      prevTimestamp != null ? (ts - prevTimestamp) / 1000 : null;
    const resumedFromBackground =
      resumeGapSec != null &&
      resumeGapSec > MEASUREMENT_METRICS_CONFIG.BACKGROUND_RESUME_RESET_GAP_SEC;

    if (resumedFromBackground) {
      // 백그라운드 복귀 직후 틱은 이전 기준점과 분리해 거리 급증을 막는다.
      prevPosRef.current = { lat: coord.lat, lng: coord.lng };
      prevMetaRef.current = locationMetaData;
      prevTimeMsRef.current = ts;
      prevEmaMpsRef.current = null;
      prevCalorieTimeRef.current = ts;
      prevCalorieTraveledRef.current = prevTraveledRef.current;
      return;
    }

    if (
      locationMetaData.accuracy != null &&
      locationMetaData.accuracy > MEASUREMENT_METRICS_CONFIG.ACCURACY_OK
    ) {
      return;
    }

    if (!prevPos) {
      prevPosRef.current = { lat: coord.lat, lng: coord.lng };
      prevMetaRef.current = locationMetaData;
      prevTraveledRef.current = 0;
      prevTimeMsRef.current = ts;
      prevCalorieTimeRef.current = ts;
      prevCalorieTraveledRef.current = 0;
      return;
    }

    const accuracyBasedMoveMeter = Math.min(
      MEASUREMENT_METRICS_CONFIG.MAX_ACCURACY_BASED_MOVE_METER,
      Math.max(
        prevMeta?.accuracy ?? 0,
        locationMetaData.accuracy ?? 0,
      ) * MEASUREMENT_METRICS_CONFIG.ACCURACY_BASED_MOVE_FACTOR,
    );
    const minEffectiveMoveMeter = Math.max(
      MEASUREMENT_METRICS_CONFIG.MIN_EFFECTIVE_MOVE_METER,
      accuracyBasedMoveMeter,
    );
    const movedMeter = getDistanceBetweenCoords(prevPos, coord);
    const prevOsSpeed = prevMeta?.osSpeed;
    const currOsSpeed = locationMetaData.osSpeed;
    const hasPrevOsSpeed = Number.isFinite(prevOsSpeed);
    const hasCurrOsSpeed = Number.isFinite(currOsSpeed);
    const averageOsSpeed =
      hasPrevOsSpeed && hasCurrOsSpeed
        ? ((prevOsSpeed as number) + (currOsSpeed as number)) / 2
        : null;

    const isOverThresholdMove = movedMeter >= minEffectiveMoveMeter;
    if (!hasStartedMovingRef.current) {
      if (isOverThresholdMove) {
        startupMoveConfirmStreakRef.current += 1;
      } else {
        startupMoveConfirmStreakRef.current = 0;
      }

      const hasOsSpeedStartEvidence =
        averageOsSpeed != null &&
        averageOsSpeed >=
          MEASUREMENT_METRICS_CONFIG.START_MOVE_CONFIRM_OS_SPEED_MPS;
      const hasStreakStartEvidence =
        startupMoveConfirmStreakRef.current >=
        MEASUREMENT_METRICS_CONFIG.START_MOVE_CONFIRM_COUNT;

      if (!hasOsSpeedStartEvidence && !hasStreakStartEvidence) {
        // 시작 직후에는 실제 이동이 확인되기 전까지 거리 누적 잠금
        prevPosRef.current = { lat: coord.lat, lng: coord.lng };
        prevMetaRef.current = locationMetaData;
        prevTimeMsRef.current = ts;
        prevCalorieTimeRef.current = ts;
        prevCalorieTraveledRef.current = prevTraveledRef.current;
        return;
      }

      hasStartedMovingRef.current = true;
    }

    let traveledMeter = calculateFreeTraveledDistanceMeter(
      prevPos,
      coord,
      prevTraveledRef.current,
      prevTimeMsRef.current,
      ts,
      minEffectiveMoveMeter,
    );

    // 저속/정지 상태 추정 시 좌표 드리프트로 인한 누적을 강하게 차단
    if (
      averageOsSpeed != null &&
      averageOsSpeed <= MEASUREMENT_METRICS_CONFIG.LOW_SPEED_SUPPRESS_MPS &&
      movedMeter < MEASUREMENT_METRICS_CONFIG.LOW_SPEED_ALLOW_MOVE_METER
    ) {
      traveledMeter = prevTraveledRef.current;
    }

    let speedMps = 0;
    if (prevMeta) {
      speedMps = calculateSpeedMps(
        prevMeta,
        locationMetaData,
        prevEmaMpsRef.current ?? undefined,
      );
    }
    prevEmaMpsRef.current = speedMps;

    const speedKmh = clampSpeedKmh(speedMpsToKmh(speedMps));
    const paceMinPerKm = paceMinPerKmFromSpeedKmh(speedKmh);

    speedHistoryRef.current.push(speedKmh);
    if (speedHistoryRef.current.length > 100) speedHistoryRef.current.shift();
    const avgSpeedKmh =
      speedHistoryRef.current.length > 0
        ? speedHistoryRef.current.reduce((a, b) => a + b, 0) /
          speedHistoryRef.current.length
        : 0;

    maxSpeedKmhRef.current = Math.max(maxSpeedKmhRef.current, speedKmh);

    let deltaCal = 0;
    const prevCT = prevCalorieTimeRef.current;
    const prevCTrav = prevCalorieTraveledRef.current;
    if (prevCT != null && prevCTrav != null) {
      const dtSec = (ts - prevCT) / 1000;
      const dDist = traveledMeter - prevCTrav;
      if (dtSec > 0 && dDist > 0) {
        deltaCal = measureCaloriesBurned(
          'biking',
          userGender,
          dtSec,
          userBirthYear != null ? Number(userBirthYear) : null,
        );
      }
    }
    accumulatedCaloriesRef.current += deltaCal;

    setMetrics({
      traveledDistanceMeter: traveledMeter,
      speedKmh,
      paceMinutesPerKm: paceMinPerKm,
      caloriesBurned: accumulatedCaloriesRef.current,
      averageSpeedKmh: avgSpeedKmh,
      maxSpeedKmh: maxSpeedKmhRef.current,
    });

    prevPosRef.current = { lat: coord.lat, lng: coord.lng };
    prevMetaRef.current = locationMetaData;
    prevTraveledRef.current = traveledMeter;
    prevTimeMsRef.current = ts;
    prevCalorieTimeRef.current = ts;
    prevCalorieTraveledRef.current = traveledMeter;
  }, [
    isMeasuring,
    locationTick,
    locationMetaData,
    userGender,
    setMetrics,
  ]);

  useEffect(() => {
    const prev = prevPhasePausedStateRef.current;
    const resumedFromPause =
      prev != null &&
      (prev.phase === 'paused' || prev.isPaused) &&
      phase === 'measuring' &&
      !isPaused;

    if (resumedFromPause) {
      // 재개 첫 틱은 pause 이전 기준점과 분리해서 dt/거리 급증을 방지
      prevPosRef.current = null;
      prevMetaRef.current = null;
      prevTimeMsRef.current = null;
      prevEmaMpsRef.current = null;
      prevCalorieTimeRef.current = null;
      prevCalorieTraveledRef.current = null;
      startupMoveConfirmStreakRef.current = 0;
      hasStartedMovingRef.current = false;
    }

    prevPhasePausedStateRef.current = { phase, isPaused };
  }, [phase, isPaused]);

  useEffect(() => {
    if (phase !== 'measuring' && phase !== 'paused') {
      prevPosRef.current = null;
      prevMetaRef.current = null;
      prevTraveledRef.current = 0;
      prevTimeMsRef.current = null;
      prevEmaMpsRef.current = null;
      prevCalorieTimeRef.current = null;
      prevCalorieTraveledRef.current = null;
      speedHistoryRef.current = [];
      accumulatedCaloriesRef.current = 0;
      maxSpeedKmhRef.current = 0;
      startupMoveConfirmStreakRef.current = 0;
      hasStartedMovingRef.current = false;
      prevPhasePausedStateRef.current = null;
    }
  }, [phase]);
}
