import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import {
  useOffRouteController,
  UseOffRouteControllerParams,
} from '@/features/navigation/hooks/useOffRouteController';
import { RouteType } from '@/features/routing/model/routing.types';
import { useReRouteMutation, useReturnToExistingRouteMutation } from '@/features/navigation/services/navigation.queries';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { getMinDistanceInWindow } from '@/features/navigation/utils/getMindistanceInWindow';
import { findClosestCoordIndex } from '@/features/navigation/utils/navigationController';
import { calculateMotionVector } from '@/features/navigation/utils/calculateMotionVector';

jest.mock('@/features/navigation/services/navigation.queries', () => ({
  useReRouteMutation: jest.fn(),
  useReturnToExistingRouteMutation: jest.fn(),
}));

jest.mock('@/features/routing/stores/useRouteStore', () => ({
  useRouteStore: {
    getState: jest.fn(),
  },
}));

jest.mock('@/features/navigation/utils/getMindistanceInWindow', () => ({
  getMinDistanceInWindow: jest.fn(),
}));

jest.mock('@/features/navigation/utils/navigationController', () => ({
  findClosestCoordIndex: jest.fn(),
}));

jest.mock('@/features/navigation/utils/calculateMotionVector', () => ({
  calculateMotionVector: jest.fn(),
}));

jest.mock('@/features/navigation/libs/playTts', () => ({
  playTts: jest.fn(),
}));

const rerouteMutateAsync = jest.fn();
const recoveryMutateAsync = jest.fn();
const mockApplyNavigationData = jest.fn();
const mockSetIsLoadingForOffRoute = jest.fn();

const TestHarness = (props: UseOffRouteControllerParams) => {
  useOffRouteController(props);
  return null;
};

const createRefs = () =>
  ({
    currentLocationMetaData: {
      current: {
        timestamp: 1000,
        accuracy: 10,
        coordinate: { lat: 37.56, lng: 126.97 },
      },
    },
    pathDataListByInterval: {
      current: [
        {
          intervalIndex: 0,
          interval: [0, 1] as [number, number],
          coordinateList: [
            { lat: 37.56, lng: 126.97 },
            { lat: 37.5605, lng: 126.9705 },
          ],
        },
      ],
    },
    currentIntervalIndex: { current: 0 },
    currentTtsUrl: { current: null },
    recoverTriggerCount: { current: 0 },
    rerouteTriggerCount: { current: 2 },
    hasReroutedRef: { current: false },
    isHandlingOffRouteRef: { current: false },
    isStationaryRef: { current: false },
    isBikingStateRef: { current: false },
    lastOffRouteTimestampRef: { current: null },
    offRouteJudgeCooldownUntilRef: { current: 0 },
    offRouteTickBusyRef: { current: false },
    accumulatedTraveledDistanceRef: { current: 0 },
    passedWaypointIdxSetRef: { current: new Set<number>() },
  }) as UseOffRouteControllerParams['refs'];

const createBaseProps = (
  refs: UseOffRouteControllerParams['refs'],
  locationTick = 1000,
): UseOffRouteControllerParams => ({
  isNavigationMode: true,
  isNavigationInitialized: true,
  sessionId: 'session-1',
  locationTick,
  systemVolume: 0.7,
  traveledDistanceMeter: 30,
  selectedRouteData: {
    routeCategory: 'shortest',
    routeId: 'route-1',
    summary: {
      distance: 1000,
      time: 200,
      ascent: 0,
      descent: 0,
      bikeRoadRatio: 0.5,
      maxGradient: 0,
    },
    bbox: {
      minLng: 0,
      minLat: 0,
      maxLng: 0,
      maxLat: 0,
    },
    startStation: {
      number: '1',
      name: 'start',
      lat: 37.56,
      lng: 126.97,
      current_bikes: 10,
    },
    endStation: {
      number: '2',
      name: 'end',
      lat: 37.57,
      lng: 126.98,
      current_bikes: 10,
    },
    waypoints: [],
    segments: [],
    coordinates: [],
  } as any,
  applyNavigationData: mockApplyNavigationData,
  setIsLoadingForOffRoute: mockSetIsLoadingForOffRoute,
  refs,
});

describe('useOffRouteController', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useReRouteMutation as jest.Mock).mockReturnValue({
      mutateAsync: rerouteMutateAsync,
    });
    (useReturnToExistingRouteMutation as jest.Mock).mockReturnValue({
      mutateAsync: recoveryMutateAsync,
    });
    (useRouteStore.getState as jest.Mock).mockReturnValue({
      routeType: RouteType.CONSTANT,
    });
    (getMinDistanceInWindow as jest.Mock).mockReturnValue(520);
    (findClosestCoordIndex as jest.Mock).mockReturnValue(0);
    (calculateMotionVector as jest.Mock).mockReturnValue({
      moveMag: 10,
      speedMps: 3,
      dot: 1,
    });

    rerouteMutateAsync.mockResolvedValue({
      data: {
        coordinates: [
          [126.97, 37.56],
          [126.971, 37.561],
        ],
        instructions: [
          {
            distance: 100,
            time: 20,
            text: '직진',
            sign: 0,
            interval: [0, 1],
            nextTurnCoordinate: { lat: 37.561, lng: 126.971 },
            ttsUrl: 'https://example.com/tts/0',
          },
        ],
        startStation: {
          stationId: 'start',
          stationName: 'start',
          location: { lat: 37.56, lng: 126.97 },
        },
        endStation: {
          stationId: 'end',
          stationName: 'end',
          location: { lat: 37.57, lng: 126.98 },
        },
        waypoints: [],
      },
    });

    recoveryMutateAsync.mockResolvedValue({
      data: {
        coordinates: [
          [126.972, 37.562],
          [126.973, 37.563],
        ],
        instructions: [
          {
            distance: 120,
            time: 30,
            text: '복귀',
            sign: 0,
            interval: [0, 1],
            nextTurnCoordinate: { lat: 37.563, lng: 126.973 },
            ttsUrl: 'https://example.com/tts/recover',
          },
        ],
        startStation: {
          stationId: 'start',
          stationName: 'start',
          location: { lat: 37.56, lng: 126.97 },
        },
        endStation: {
          stationId: 'end',
          stationName: 'end',
          location: { lat: 37.57, lng: 126.98 },
        },
        waypoints: [],
      },
    });
  });

  it('초기 구간 오프루트에서 reroute를 1회 실행하고 전체 경로(all)로 적용한다', async () => {
    const refs = createRefs();
    const props = createBaseProps(refs);

    render(<TestHarness {...props} />);

    await waitFor(() => {
      expect(rerouteMutateAsync).toHaveBeenCalledTimes(1);
    });

    expect(rerouteMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        travelMode: 'walking',
      }),
    );
    expect(mockApplyNavigationData).toHaveBeenCalledWith(
      expect.objectContaining({
        coordinates: expect.any(Array),
      }),
      'all',
    );
    expect(refs.hasReroutedRef.current).toBe(true);
    expect(refs.offRouteJudgeCooldownUntilRef.current).toBeGreaterThan(1000);
  });

  it('hasRerouted 이후에는 저속 상태(isBiking=false)여도 recovery가 실행된다', async () => {
    const refs = createRefs();
    refs.hasReroutedRef.current = true;
    refs.recoverTriggerCount.current = 3;
    refs.rerouteTriggerCount.current = 0;

    const props = createBaseProps(refs, 2000);

    render(<TestHarness {...props} />);

    await waitFor(() => {
      expect(recoveryMutateAsync).toHaveBeenCalledTimes(1);
    });

    expect(rerouteMutateAsync).not.toHaveBeenCalled();
    expect(mockApplyNavigationData).toHaveBeenCalledWith(
      expect.objectContaining({
        instructions: expect.any(Array),
      }),
      'only-end',
    );
  });

  it('loop 경로에서 recovery는 시작 도보/원점 렌더를 위해 all 정책으로 적용한다', async () => {
    const refs = createRefs();
    refs.hasReroutedRef.current = true;
    refs.recoverTriggerCount.current = 3;
    refs.rerouteTriggerCount.current = 0;
    (useRouteStore.getState as jest.Mock).mockReturnValue({
      routeType: RouteType.LOOP,
    });

    const props = createBaseProps(refs, 2100);

    render(<TestHarness {...props} />);

    await waitFor(() => {
      expect(recoveryMutateAsync).toHaveBeenCalledTimes(1);
    });

    expect(mockApplyNavigationData).toHaveBeenCalledWith(
      expect.objectContaining({
        instructions: expect.any(Array),
      }),
      'all',
    );
  });

  it('쿨다운 시간 내에는 off-route 판정을 스킵해서 재트리거를 막는다', async () => {
    const refs = createRefs();
    refs.offRouteJudgeCooldownUntilRef.current = 10_000;
    const props = createBaseProps(refs, 3000);

    render(<TestHarness {...props} />);

    await waitFor(() => {
      expect(rerouteMutateAsync).not.toHaveBeenCalled();
      expect(recoveryMutateAsync).not.toHaveBeenCalled();
    });
  });

  it('reroute 직후 30초는 recovery가 잠기고 lock 구간에서는 recovery가 실행되지 않는다', async () => {
    const refs = createRefs();
    const props = createBaseProps(refs, 1000);

    // 1) reroute 발생
    const { rerender } = render(<TestHarness {...props} />);

    await waitFor(() => {
      expect(rerouteMutateAsync).toHaveBeenCalledTimes(1);
    });

    // 2) lock 구간(30초 이내)에서는 recovery 조건이어도 실행 안됨
    refs.hasReroutedRef.current = true;
    refs.recoverTriggerCount.current = 3;
    refs.currentLocationMetaData.current = {
      timestamp: 5000,
      accuracy: 10,
      coordinate: { lat: 37.5601, lng: 126.9701 },
    };
    (getMinDistanceInWindow as jest.Mock).mockReturnValue(520);
    rerender(<TestHarness {...props} locationTick={5000} />);

    await waitFor(() => {
      expect(recoveryMutateAsync).not.toHaveBeenCalled();
    });

    // 3) lock 해제 이후: 3회 연속 접근(near + dot>0) unlock 후보 적립
    (getMinDistanceInWindow as jest.Mock).mockReturnValue(250);
    (calculateMotionVector as jest.Mock).mockReturnValue({
      moveMag: 10,
      speedMps: 3,
      dot: 1,
    });

    refs.currentLocationMetaData.current = {
      timestamp: 32_000,
      accuracy: 10,
      coordinate: { lat: 37.5602, lng: 126.9702 },
    };
    rerender(<TestHarness {...props} locationTick={32_000} />);

    refs.currentLocationMetaData.current = {
      timestamp: 33_000,
      accuracy: 10,
      coordinate: { lat: 37.5603, lng: 126.9703 },
    };
    rerender(<TestHarness {...props} locationTick={33_000} />);

    refs.currentLocationMetaData.current = {
      timestamp: 34_000,
      accuracy: 10,
      coordinate: { lat: 37.5604, lng: 126.9704 },
    };
    rerender(<TestHarness {...props} locationTick={34_000} />);

    await waitFor(() => {
      expect(calculateMotionVector).toHaveBeenCalled();
      expect(recoveryMutateAsync).not.toHaveBeenCalled();
    });
  });
});
