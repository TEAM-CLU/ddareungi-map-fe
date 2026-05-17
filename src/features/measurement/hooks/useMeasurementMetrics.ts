import { useEffect, useRef } from 'react';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { useMeasurementStore } from '../stores/useMeasurementStore';
import { useUserInfoQuery } from '@/features/auth/services/user.queries';
import { MEASUREMENT_METRICS_CONFIG } from '../model/measurement.constants';
import { measureCaloriesBurned } from '@/shared/utils/measure';
import {
  calculateMeasurementTraveledDistanceMeter,
  calculateSpeedMps,
  getDistanceNoiseGateMeter,
  hasTrustedMeasurementOsSpeed,
  hasUsableMeasurementOsSpeed,
  isLocationAccurateEnoughForMeasurement,
  speedMpsToKmh,
  paceMinPerKmFromSpeedKmh,
  clampSpeedKmh,
} from '../utils/measurementDistanceUtils';

export function useMeasurementMetrics(): void {
  const locationMetaData = useMyPositionStore(s => s.locationMetaData);
  const locationTick = locationMetaData?.timestamp;

  const {
    phase,
    isPaused,
    elapsedTimeSeconds,
    setMetrics,
  } = useMeasurementStore();
  const accumulatedCaloriesRef = useRef(0);

  const { data: userInfo } = useUserInfoQuery();
  const userGender = userInfo?.data?.gender ?? undefined;
  const userBirthYear = userInfo?.data?.birthYear ?? null;

  const prevSpeedMetaRef = useRef<typeof locationMetaData | null>(null);
  const distanceAnchorMetaRef = useRef<typeof locationMetaData | null>(null);
  const prevTraveledRef = useRef(0);
  const prevEmaMpsRef = useRef<number | null>(null);
  const prevCalorieTimeRef = useRef<number | null>(null);
  const prevCalorieTraveledRef = useRef<number | null>(null);
  const speedHistoryRef = useRef<number[]>([]);
  const maxSpeedKmhRef = useRef(0);
  const lastLocationUpdateWallClockRef = useRef<number | null>(null);
  const hasResetStaleSpeedRef = useRef(false);
  const prevPhasePausedStateRef = useRef<{
    phase: typeof phase;
    isPaused: boolean;
  } | null>(null);

  const isMeasuring =
    phase === 'measuring' && !isPaused && locationMetaData?.coordinate;

  useEffect(() => {
    if (locationTick == null) return;

    lastLocationUpdateWallClockRef.current = Date.now();
    hasResetStaleSpeedRef.current = false;
  }, [locationTick]);

  useEffect(() => {
    if (!isMeasuring || !locationMetaData?.coordinate) return;

    const ts = locationMetaData.timestamp ?? Date.now();
    const prevSpeedMeta = prevSpeedMetaRef.current;
    const distanceAnchorMeta = distanceAnchorMetaRef.current;
    const prevTimestamp = prevSpeedMeta?.timestamp ?? null;
    const hasUsableLiveOsSpeed = hasUsableMeasurementOsSpeed(locationMetaData);
    const canUseCoordinateDistance = isLocationAccurateEnoughForMeasurement(
      locationMetaData.accuracy,
    );

    const resumeGapSec =
      prevTimestamp != null ? (ts - prevTimestamp) / 1000 : null;
    const resumedFromBackground =
      resumeGapSec != null &&
      resumeGapSec > MEASUREMENT_METRICS_CONFIG.BACKGROUND_RESUME_RESET_GAP_SEC;

    if (resumedFromBackground) {
      // 백그라운드 복귀 직후 틱은 이전 기준점과 분리해 거리 급증을 막는다.
      prevSpeedMetaRef.current = locationMetaData;
      distanceAnchorMetaRef.current = locationMetaData;
      prevEmaMpsRef.current = null;
      prevCalorieTimeRef.current = ts;
      prevCalorieTraveledRef.current = prevTraveledRef.current;
      return;
    }

    if (!canUseCoordinateDistance && !hasUsableLiveOsSpeed) {
      return;
    }

    if (!prevSpeedMeta || !distanceAnchorMeta) {
      prevSpeedMetaRef.current = locationMetaData;
      distanceAnchorMetaRef.current = locationMetaData;
      prevCalorieTimeRef.current = ts;
      prevCalorieTraveledRef.current = prevTraveledRef.current;
      return;
    }

    const distanceNoiseGateMeter = getDistanceNoiseGateMeter(
      distanceAnchorMeta.accuracy,
      locationMetaData.accuracy,
    );
    // 이전 방식: 좌표 이동량만 거리 누적에 반영한다.
    // trusted OS speed가 안정적이어도 GPS 좌표가 noise gate 아래면 평균 속도가 과하게 낮아질 수 있어 보존만 한다.
    // const traveledMeter = calculateFreeTraveledDistanceMeter(
    //   distanceAnchorMeta.coordinate,
    //   locationMetaData.coordinate,
    //   prevTraveledRef.current,
    //   distanceAnchorMeta.timestamp,
    //   ts,
    //   distanceNoiseGateMeter,
    // );
    const traveledMeter = calculateMeasurementTraveledDistanceMeter({
      distanceAnchorMeta,
      currentMeta: locationMetaData,
      prevTraveledMeter: prevTraveledRef.current,
      minEffectiveMoveMeter: distanceNoiseGateMeter,
      shouldUseCoordinateDistance: canUseCoordinateDistance,
    });
    const acceptedDistanceDeltaMeter = traveledMeter - prevTraveledRef.current;

    let speedMps = calculateSpeedMps(
      prevSpeedMeta,
      locationMetaData,
      prevEmaMpsRef.current ?? undefined,
    );
    const hasLiveSpeedEvidence =
      hasUsableLiveOsSpeed || hasTrustedMeasurementOsSpeed(prevSpeedMeta);
    if (
      acceptedDistanceDeltaMeter === 0 &&
      !hasLiveSpeedEvidence &&
      speedMps < MEASUREMENT_METRICS_CONFIG.STOPPED_SPEED_CUTOFF_MPS
    ) {
      speedMps = 0;
    }
    prevEmaMpsRef.current = speedMps;

    const speedKmh = clampSpeedKmh(speedMpsToKmh(speedMps));
    const paceMinPerKm = paceMinPerKmFromSpeedKmh(speedKmh);

    // 이전 방식은 정지/콜드스타트 0km/h 샘플까지 평균에 포함해 주행 중 평균이 2~3km/h로 눌릴 수 있었다.
    // speedHistoryRef.current.push(speedKmh);
    const shouldRecordAverageSpeedSample =
      acceptedDistanceDeltaMeter > 0 ||
      speedMps >= MEASUREMENT_METRICS_CONFIG.STOPPED_SPEED_CUTOFF_MPS;
    if (shouldRecordAverageSpeedSample) {
      speedHistoryRef.current.push(speedKmh);
      if (speedHistoryRef.current.length > 100) speedHistoryRef.current.shift();
    }
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

    if (acceptedDistanceDeltaMeter > 0) {
      distanceAnchorMetaRef.current = locationMetaData;
    }
    prevSpeedMetaRef.current = locationMetaData;
    prevTraveledRef.current = traveledMeter;
    prevCalorieTimeRef.current = ts;
    prevCalorieTraveledRef.current = traveledMeter;
  }, [
    isMeasuring,
    locationTick,
    locationMetaData,
    userGender,
    userBirthYear,
    setMetrics,
  ]);

  useEffect(() => {
    if (phase !== 'measuring' || isPaused) return;
    if (hasResetStaleSpeedRef.current) return;

    const lastLocationUpdateWallClock = lastLocationUpdateWallClockRef.current;
    if (lastLocationUpdateWallClock == null) return;

    const staleLocationSec =
      (Date.now() - lastLocationUpdateWallClock) / 1000;
    if (
      staleLocationSec <
      MEASUREMENT_METRICS_CONFIG.STALE_LOCATION_SPEED_RESET_SEC
    ) {
      return;
    }

    hasResetStaleSpeedRef.current = true;
    prevEmaMpsRef.current = null;
    setMetrics({
      speedKmh: 0,
      paceMinutesPerKm: null,
    });
  }, [elapsedTimeSeconds, isPaused, phase, setMetrics]);

  useEffect(() => {
    const prev = prevPhasePausedStateRef.current;
    const resumedFromPause =
      prev != null &&
      (prev.phase === 'paused' || prev.isPaused) &&
      phase === 'measuring' &&
      !isPaused;

    if (resumedFromPause) {
      // 재개 첫 틱은 pause 이전 기준점과 분리해서 dt/거리 급증을 방지
      prevSpeedMetaRef.current = null;
      distanceAnchorMetaRef.current = null;
      prevEmaMpsRef.current = null;
      prevCalorieTimeRef.current = null;
      prevCalorieTraveledRef.current = null;
    }

    prevPhasePausedStateRef.current = { phase, isPaused };
  }, [phase, isPaused]);

  useEffect(() => {
    if (phase !== 'measuring' && phase !== 'paused') {
      prevSpeedMetaRef.current = null;
      distanceAnchorMetaRef.current = null;
      prevTraveledRef.current = 0;
      prevEmaMpsRef.current = null;
      prevCalorieTimeRef.current = null;
      prevCalorieTraveledRef.current = null;
      speedHistoryRef.current = [];
      accumulatedCaloriesRef.current = 0;
      maxSpeedKmhRef.current = 0;
      lastLocationUpdateWallClockRef.current = null;
      hasResetStaleSpeedRef.current = false;
      prevPhasePausedStateRef.current = null;
    }
  }, [phase]);
}
