import { createMeasurementSessionResult } from '@/features/measurement/utils/createMeasurementSessionResult';
import { MeasurementLiveMetrics } from '@/features/measurement/model/measurement.types';

describe('createMeasurementSessionResult', () => {
  const createMetrics = (
    overrides: Partial<MeasurementLiveMetrics>,
  ): MeasurementLiveMetrics => ({
    traveledDistanceMeter: 211,
    caloriesBurned: 4.6,
    paceMinutesPerKm: 60 / 18,
    speedKmh: 18,
    averageSpeedKmh: 18,
    maxSpeedKmh: 18,
    ...overrides,
  });

  it('종료 요약 평균 페이스는 전체 elapsed/distance보다 측정 중 평균 속도를 우선한다', () => {
    const result = createMeasurementSessionResult({
      metrics: createMetrics({}),
      elapsedTimeSeconds: 61,
    });

    expect(result.averageSpeedKmh).toBe(18);
    expect(result.averagePaceMinutesPerKm).toBeCloseTo(3.333, 3);
  });

  it('측정 중 평균 속도가 없으면 기존 전체 시간 기반 평균으로 fallback한다', () => {
    const result = createMeasurementSessionResult({
      metrics: createMetrics({ averageSpeedKmh: 0 }),
      elapsedTimeSeconds: 61,
    });

    expect(result.averageSpeedKmh).toBeCloseTo(12.452, 3);
    expect(result.averagePaceMinutesPerKm).toBeCloseTo(4.818, 3);
  });
});
