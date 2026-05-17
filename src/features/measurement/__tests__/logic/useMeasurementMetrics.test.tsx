import React from 'react';
import { act, render } from '@testing-library/react-native';
import { useMeasurementMetrics } from '@/features/measurement/hooks/useMeasurementMetrics';
import { useMeasurementStore } from '@/features/measurement/stores/useMeasurementStore';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { LocationMetaData } from '@/features/navigation/model/navigation.types';
import { MEASUREMENT_METRICS_CONFIG } from '@/features/measurement/model/measurement.constants';

jest.mock('@/features/auth/services/user.queries', () => ({
  useUserInfoQuery: () => ({
    data: {
      data: {
        gender: 'M',
        birthYear: '1994',
      },
    },
  }),
}));

const TestHarness = () => {
  useMeasurementMetrics();
  return null;
};

const setLocationMetaData = (locationMetaData: LocationMetaData) => {
  act(() => {
    useMyPositionStore.getState().setLocationMetaData(locationMetaData);
  });
};

describe('useMeasurementMetrics', () => {
  beforeEach(() => {
    act(() => {
      useMeasurementStore.getState().resetSession();
      useMyPositionStore.getState().setLocationMetaData({
        timestamp: 0,
        accuracy: 8,
        coordinate: { lat: 37.5665, lng: 126.978 },
      });
    });
  });

  it('일시정지 후 재개해도 이동거리 누적값을 유지한다', () => {
    render(<TestHarness />);

    act(() => {
      useMeasurementStore.getState().setPhase('measuring');
      useMeasurementStore.getState().setIsPaused(false);
    });

    setLocationMetaData({
      timestamp: 1000,
      accuracy: 8,
      coordinate: { lat: 37.56654, lng: 126.978 },
    });

    const traveledBeforePause =
      useMeasurementStore.getState().metrics.traveledDistanceMeter;

    expect(traveledBeforePause).toBeGreaterThanOrEqual(4);

    act(() => {
      useMeasurementStore.getState().setIsPaused(true);
      useMeasurementStore.getState().setPhase('paused');
    });

    act(() => {
      useMeasurementStore.getState().setIsPaused(false);
      useMeasurementStore.getState().setPhase('measuring');
    });

    setLocationMetaData({
      timestamp: 2000,
      accuracy: 8,
      coordinate: { lat: 37.56654, lng: 126.978 },
    });

    expect(useMeasurementStore.getState().metrics.traveledDistanceMeter).toBe(
      traveledBeforePause,
    );

    setLocationMetaData({
      timestamp: 3000,
      accuracy: 8,
      coordinate: { lat: 37.56658, lng: 126.978 },
    });

    expect(
      useMeasurementStore.getState().metrics.traveledDistanceMeter,
    ).toBeGreaterThan(traveledBeforePause);
  });

  it('GPS 이동이 noise gate 아래여도 usable OS speed로 표시 속도와 거리를 유지한다', () => {
    render(<TestHarness />);

    act(() => {
      useMeasurementStore.getState().setPhase('measuring');
      useMeasurementStore.getState().setIsPaused(false);
    });

    setLocationMetaData({
      timestamp: 1000,
      accuracy: 70,
      osSpeed: 5,
      coordinate: { lat: 37.566501, lng: 126.978 },
    });

    const metrics = useMeasurementStore.getState().metrics;

    expect(metrics.traveledDistanceMeter).toBeGreaterThanOrEqual(5);
    expect(metrics.speedKmh).toBeGreaterThan(17);
    expect(metrics.averageSpeedKmh).toBeGreaterThan(17);
  });

  it('좌표 정확도가 낮아도 usable OS speed는 측정 화면 속도에 즉시 반영한다', () => {
    render(<TestHarness />);

    act(() => {
      useMeasurementStore.getState().setPhase('measuring');
      useMeasurementStore.getState().setIsPaused(false);
    });

    setLocationMetaData({
      timestamp: 1000,
      accuracy: 140,
      osSpeed: 5.2,
      coordinate: { lat: 37.566501, lng: 126.978 },
    });

    const metrics = useMeasurementStore.getState().metrics;

    expect(metrics.traveledDistanceMeter).toBeGreaterThanOrEqual(5);
    expect(metrics.speedKmh).toBeGreaterThan(18);
  });

  it('위치 업데이트가 끊긴 정지 상태에서는 마지막 표시 속도와 페이스를 유지하지 않는다', () => {
    const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(0);
    render(<TestHarness />);

    act(() => {
      useMeasurementStore.getState().setPhase('measuring');
      useMeasurementStore.getState().setIsPaused(false);
    });

    setLocationMetaData({
      timestamp: 1000,
      accuracy: 8,
      osSpeed: 3,
      coordinate: { lat: 37.566527, lng: 126.978 },
    });

    const movingMetrics = useMeasurementStore.getState().metrics;
    expect(movingMetrics.speedKmh).toBeCloseTo(10.8, 1);
    expect(movingMetrics.paceMinutesPerKm).not.toBeNull();

    dateNowSpy.mockReturnValue(
      (MEASUREMENT_METRICS_CONFIG.STALE_LOCATION_SPEED_RESET_SEC + 1) * 1000,
    );

    act(() => {
      useMeasurementStore.getState().setElapsedTimeSeconds(
        MEASUREMENT_METRICS_CONFIG.STALE_LOCATION_SPEED_RESET_SEC + 1,
      );
    });

    const staleMetrics = useMeasurementStore.getState().metrics;
    expect(staleMetrics.speedKmh).toBe(0);
    expect(staleMetrics.paceMinutesPerKm).toBeNull();
    expect(staleMetrics.traveledDistanceMeter).toBe(
      movingMetrics.traveledDistanceMeter,
    );

    dateNowSpy.mockRestore();
  });
});
