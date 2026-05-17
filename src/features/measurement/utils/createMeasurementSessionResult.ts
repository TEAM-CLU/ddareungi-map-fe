import {
  MeasurementLiveMetrics,
  MeasurementSessionResult,
} from '../model/measurement.types';

interface CreateMeasurementSessionResultParams {
  metrics: MeasurementLiveMetrics;
  elapsedTimeSeconds: number;
}

function calculateTotalAverageSpeedKmh(
  traveledDistanceMeter: number,
  elapsedTimeSeconds: number,
): number {
  const distanceKm = traveledDistanceMeter / 1000;

  return elapsedTimeSeconds > 0 && distanceKm > 0
    ? distanceKm / (elapsedTimeSeconds / 3600)
    : 0;
}

export function createMeasurementSessionResult({
  metrics,
  elapsedTimeSeconds,
}: CreateMeasurementSessionResultParams): MeasurementSessionResult {
  // 이전 종료 요약은 전체 소요시간 / 이동거리만 사용해 콜드스타트·정지 시간이 평균 페이스를 크게 눌렀다.
  const totalAverageSpeedKmh = calculateTotalAverageSpeedKmh(
    metrics.traveledDistanceMeter,
    elapsedTimeSeconds,
  );
  const averageSpeedKmh =
    metrics.averageSpeedKmh > 0 ? metrics.averageSpeedKmh : totalAverageSpeedKmh;
  const averagePaceMinutesPerKm =
    averageSpeedKmh > 0 ? 60 / averageSpeedKmh : null;

  return {
    traveledDistanceMeter: metrics.traveledDistanceMeter,
    elapsedTimeSeconds,
    caloriesBurned: metrics.caloriesBurned,
    averagePaceMinutesPerKm,
    averageSpeedKmh,
    maxSpeedKmh: metrics.maxSpeedKmh,
  };
}
