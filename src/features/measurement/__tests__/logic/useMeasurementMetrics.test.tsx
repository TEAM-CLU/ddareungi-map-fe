import React from 'react';
import { act, render } from '@testing-library/react-native';
import { useMeasurementMetrics } from '@/features/measurement/hooks/useMeasurementMetrics';
import { useMeasurementStore } from '@/features/measurement/stores/useMeasurementStore';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { LocationMetaData } from '@/features/navigation/model/navigation.types';

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
});
