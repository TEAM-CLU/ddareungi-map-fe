import { Coordinate } from '@/shared/model/shared.types';
import { LocationMetaData } from '@/features/navigation/model/navigation.types';
import { getDistanceBetweenCoords } from '@/shared/utils/measure';
import { MEASUREMENT_METRICS_CONFIG } from '../model/measurement.constants';
import {
  MOTION_COMMON_OPTIONS,
  TRAVELED_DISTANCE_OPTIONS,
} from '@/features/navigation/model/navigation.constants';

const { MAX_PHYSICAL_SPEED_MPS, DT_SEC_CAP } = MOTION_COMMON_OPTIONS;
const { STOP_JUDGE_MOVE_METER } = TRAVELED_DISTANCE_OPTIONS;
const {
  MIN_DISTANCE_NOISE_METER,
  MAX_DISTANCE_NOISE_METER,
  DISTANCE_NOISE_ACCURACY_FACTOR,
  HARD_REJECT_ACCURACY_METER,
  OS_SPEED_TRUST_ACCURACY_METER,
  OS_SPEED_BLEND_WEIGHT,
  SPEED_RISE_EMA_ALPHA,
  SPEED_FALL_EMA_ALPHA,
} = MEASUREMENT_METRICS_CONFIG;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

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

  const deltaMeter = calculateDistanceDeltaMeter(
    prevPosition,
    currentPosition,
    prevTimestampMs,
    currentTimestampMs,
    minEffectiveMoveMeter,
  );

  return prevTraveledMeter + deltaMeter;
}

export function calculateDistanceDeltaMeter(
  prevPosition: Coordinate | null,
  currentPosition: Coordinate,
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
    if (instantSpeedMps > MAX_PHYSICAL_SPEED_MPS) return 0;
    if (movedMeter < minEffectiveMoveMeter) return 0;
  }

  let next = movedMeter;
  if (dtSec != null) {
    const maxDelta = MAX_PHYSICAL_SPEED_MPS * dtSec;
    next = Math.min(next, maxDelta);
  }
  return next;
}

const ema = (prev: number, curr: number, alpha: number) =>
  alpha * curr + (1 - alpha) * prev;

const hasNum = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

const hasUsableAccuracy = (accuracy?: number): accuracy is number =>
  hasNum(accuracy) && accuracy >= 0;

export function hasTrustedMeasurementOsSpeed(
  locationMetaData?: Pick<LocationMetaData, 'accuracy' | 'osSpeed'> | null,
): boolean {
  if (!locationMetaData) return false;

  return (
    hasNum(locationMetaData.osSpeed) &&
    locationMetaData.osSpeed >= 0 &&
    locationMetaData.osSpeed <= MAX_PHYSICAL_SPEED_MPS &&
    (!hasUsableAccuracy(locationMetaData.accuracy) ||
      locationMetaData.accuracy <= OS_SPEED_TRUST_ACCURACY_METER)
  );
}

export function isLocationAccurateEnoughForMeasurement(
  accuracy?: number,
): boolean {
  return !hasUsableAccuracy(accuracy) || accuracy <= HARD_REJECT_ACCURACY_METER;
}

export function getDistanceNoiseGateMeter(
  prevAccuracy?: number,
  currentAccuracy?: number,
): number {
  const accuracies: number[] = [prevAccuracy, currentAccuracy].filter(
    hasUsableAccuracy,
  );
  const effectiveAccuracy =
    accuracies.length > 0
      ? accuracies.reduce((sum, accuracy) => sum + accuracy, 0) /
        accuracies.length
      : 0;

  return clamp(
    effectiveAccuracy * DISTANCE_NOISE_ACCURACY_FACTOR,
    MIN_DISTANCE_NOISE_METER,
    MAX_DISTANCE_NOISE_METER,
  );
}

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
    return ema(prevEmaMps ?? 0, 0, SPEED_FALL_EMA_ALPHA);
  }

  const dist = getDistanceBetweenCoords(prevMeta.coordinate, currMeta.coordinate);
  const raw = dist / dt;
  const normalizedRaw =
    Number.isFinite(raw) && raw >= 0 && raw <= MAX_PHYSICAL_SPEED_MPS ? raw : 0;

  const hasTrustedCurrOsSpeed = hasTrustedMeasurementOsSpeed(currMeta);
  const hasTrustedPrevOsSpeed = hasTrustedMeasurementOsSpeed(prevMeta);

  let targetMps = normalizedRaw;
  if (hasTrustedCurrOsSpeed) {
    targetMps = currMeta.osSpeed as number;
  } else if (hasTrustedPrevOsSpeed && normalizedRaw > 0) {
    const previousOsSpeed = prevMeta.osSpeed as number;
    targetMps =
      previousOsSpeed * (OS_SPEED_BLEND_WEIGHT * 0.5) +
      normalizedRaw * (1 - OS_SPEED_BLEND_WEIGHT * 0.5);
  }

  const base =
    prevEmaMps ??
    (hasTrustedCurrOsSpeed
      ? (currMeta.osSpeed as number)
      : hasTrustedPrevOsSpeed
      ? (prevMeta.osSpeed as number)
      : targetMps);
  const alpha = targetMps >= base ? SPEED_RISE_EMA_ALPHA : SPEED_FALL_EMA_ALPHA;

  return ema(base, targetMps, alpha);
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
