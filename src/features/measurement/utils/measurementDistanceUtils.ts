import { Coordinate } from '@/shared/model/shared.types';
import { LocationMetaData } from '@/features/navigation/model/navigation.types';
import { getDistanceBetweenCoords } from '@/shared/utils/measure';
import {
  MEASUREMENT_METRICS_CONFIG,
} from '../model/measurement.constants';
import {
  MOTION_COMMON_OPTIONS,
  TRAVELED_DISTANCE_OPTIONS,
} from '@/features/navigation/model/navigation.constants';

const { MAX_PHYSICAL_SPEED_MPS, DT_SEC_CAP } = MOTION_COMMON_OPTIONS;
const { STOP_JUDGE_MOVE_METER } = TRAVELED_DISTANCE_OPTIONS;

/**
 * 경로 없이 자유 이동 시 누적 거리 계산 (GPS 점프·정지 보정 적용)
 */
export function calculateFreeTraveledDistanceMeter(
  prevPosition: Coordinate | null,
  currentPosition: Coordinate,
  prevTraveledMeter: number,
  prevTimestampMs: number | null,
  currentTimestampMs: number,
  minEffectiveMoveMeter: number = STOP_JUDGE_MOVE_METER,
): number {
  if (!prevPosition) return 0;

  const rawDtSec =
    prevTimestampMs != null
      ? Math.max(0.001, (currentTimestampMs - prevTimestampMs) / 1000)
      : null;
  const dtSec = rawDtSec != null ? Math.min(rawDtSec, DT_SEC_CAP) : null;

  const movedMeter = getDistanceBetweenCoords(prevPosition, currentPosition);

  if (dtSec != null) {
    const instantSpeedMps = movedMeter / dtSec;
    if (instantSpeedMps > MAX_PHYSICAL_SPEED_MPS) return prevTraveledMeter;
    if (movedMeter < minEffectiveMoveMeter) return prevTraveledMeter;
  }

  let next = Math.max(prevTraveledMeter, prevTraveledMeter + movedMeter);
  if (dtSec != null) {
    const maxDelta = MAX_PHYSICAL_SPEED_MPS * dtSec;
    next = Math.min(next, prevTraveledMeter + maxDelta);
  }
  return Math.round(next);
}

const ema = (prev: number, curr: number, alpha = 0.2) =>
  alpha * curr + (1 - alpha) * prev;

const hasNum = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

/**
 * 측정용 속도(m/s) — EMA 보정
 */
export function calculateSpeedMps(
  prevMeta: LocationMetaData,
  currMeta: LocationMetaData,
  prevEmaMps?: number,
): number {
  const dt = (currMeta.timestamp - prevMeta.timestamp) / 1000;
  if (dt <= 0 || !Number.isFinite(dt)) {
    return ema(prevEmaMps ?? 0, 0);
  }

  if (
    hasNum(prevMeta.accuracy) &&
    hasNum(prevMeta.osSpeed) &&
    hasNum(currMeta.accuracy) &&
    hasNum(currMeta.osSpeed)
  ) {
    const base = prevEmaMps ?? prevMeta.osSpeed;
    if (currMeta.accuracy <= MEASUREMENT_METRICS_CONFIG.ACCURACY_OK) {
      return ema(base, currMeta.osSpeed);
    }
    const dist = getDistanceBetweenCoords(prevMeta.coordinate, currMeta.coordinate);
    const raw = dist / dt;
    return ema(base, Number.isFinite(raw) ? raw : 0);
  }

  const dist = getDistanceBetweenCoords(prevMeta.coordinate, currMeta.coordinate);
  const raw = dist / dt;
  const base =
    prevEmaMps ??
    (hasNum(prevMeta.osSpeed) ? prevMeta.osSpeed : raw);
  return ema(base, Number.isFinite(raw) ? raw : 0);
}

export function speedMpsToKmh(mps: number): number {
  return (mps * 3600) / 1000;
}

export function paceMinPerKmFromSpeedKmh(speedKmh: number): number | null {
  if (speedKmh <= 0 || !Number.isFinite(speedKmh)) return null;
  const pace = 60 / speedKmh;
  if (!Number.isFinite(pace)) return null;
  const { MIN_PACE_MIN_PER_KM, MAX_PACE_MIN_PER_KM } = MEASUREMENT_METRICS_CONFIG;
  if (pace < MIN_PACE_MIN_PER_KM) return MIN_PACE_MIN_PER_KM;
  if (pace > MAX_PACE_MIN_PER_KM) return MAX_PACE_MIN_PER_KM;
  return pace;
}

export function clampSpeedKmh(kmh: number): number {
  const { MIN_SPEED_KMH, MAX_SPEED_KMH } = MEASUREMENT_METRICS_CONFIG;
  if (!Number.isFinite(kmh) || kmh < MIN_SPEED_KMH) return MIN_SPEED_KMH;
  if (kmh > MAX_SPEED_KMH) return MAX_SPEED_KMH;
  return kmh;
}
