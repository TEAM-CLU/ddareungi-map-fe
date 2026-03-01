import { useEffect, useRef } from 'react';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { useMeasurementStore } from '../stores/useMeasurementStore';
import { useUserInfoQuery } from '@/features/auth/services/user.queries';
import { measureCaloriesBurned } from '@/shared/utils/measure';
import { Gender } from '@/shared/model/shared.types';
import { MEASUREMENT_METRICS_CONFIG } from '../model/measurement.constants';
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

  const { phase, isPaused, setMetrics, metrics } = useMeasurementStore();
  const accumulatedCaloriesRef = useRef(0);

  const { data: userInfo } = useUserInfoQuery();
  const userGender: Gender = userInfo?.data?.gender ?? undefined;

  const prevMetaRef = useRef<typeof locationMetaData | null>(null);
  const prevPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const prevTraveledRef = useRef(0);
  const prevTimeMsRef = useRef<number | null>(null);
  const prevEmaMpsRef = useRef<number | null>(null);
  const prevCalorieTimeRef = useRef<number | null>(null);
  const prevCalorieTraveledRef = useRef<number | null>(null);
  const speedHistoryRef = useRef<number[]>([]);
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

    const traveledMeter = calculateFreeTraveledDistanceMeter(
      prevPos,
      coord,
      prevTraveledRef.current,
      prevTimeMsRef.current,
      ts,
    );

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

    let deltaCal = 0;
    const prevCT = prevCalorieTimeRef.current;
    const prevCTrav = prevCalorieTraveledRef.current;
    if (prevCT != null && prevCTrav != null) {
      const dtSec = (ts - prevCT) / 1000;
      const dDist = traveledMeter - prevCTrav;
      if (dtSec > 0 && dDist > 0) {
        deltaCal = measureCaloriesBurned('biking', userGender, dtSec);
      }
    }
    accumulatedCaloriesRef.current += deltaCal;

    setMetrics({
      traveledDistanceMeter: traveledMeter,
      speedKmh,
      paceMinutesPerKm: paceMinPerKm,
      caloriesBurned: accumulatedCaloriesRef.current,
      averageSpeedKmh: avgSpeedKmh,
    });

    prevPosRef.current = { lat: coord.lat, lng: coord.lng };
    prevMetaRef.current = locationMetaData;
    prevTraveledRef.current = traveledMeter;
    prevTimeMsRef.current = ts;
    prevCalorieTimeRef.current = ts;
    prevCalorieTraveledRef.current = traveledMeter;
  }, [isMeasuring, locationTick, locationMetaData, userGender, setMetrics]);

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
      prevPhasePausedStateRef.current = null;
    }
  }, [phase]);
}
