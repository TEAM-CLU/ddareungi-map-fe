import React from 'react';
import { render } from '@testing-library/react-native';
import { useWaypointController } from '@/features/navigation/hooks/useWaypointController';
import { Route } from '@/features/routing/model/routing.types';
import { playTts } from '@/features/navigation/libs/playTts';
import { NavigationInstruction } from '@/features/navigation/model/navigation.types';

jest.mock('@/features/navigation/libs/playTts', () => ({
  playTts: jest.fn(),
}));

jest.mock('@/features/navigation/utils/navigationQaLog', () => ({
  writeNavigationQaLog: jest.fn(),
}));

type TestProps = Parameters<typeof useWaypointController>[0];

const TestHarness = (props: TestProps) => {
  useWaypointController(props);
  return null;
};

const createRefs = () => ({
  passedWaypointIdxSetRef: { current: new Set<number>() },
  isWaypointEnteredRef: { current: false },
  waypointCandidateIdxRef: { current: -1 },
  waypointPassCountRef: { current: 0 },
  fullPathCoordinateList: { current: [] as [number, number][] },
  instructionList: { current: [] as NavigationInstruction[] },
  currentIntervalIndex: { current: 0 },
});

const createRoute = (): Route =>
  ({
    routeCategory: 'bike_priority',
    routeId: 'route-1',
    waypoints: [{ lat: 37.0, lng: 127.0 }],
  } as Route);

describe('useWaypointController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('위치 갱신 사이에 경유지를 통과하면 지나침으로 인정한다', () => {
    const refs = createRefs();
    const setPassedWaypointIndexes = jest.fn();

    const baseProps: TestProps = {
      isNavigationMode: true,
      isNavigationInitialized: true,
      locationMetaData: {
        timestamp: 1000,
        accuracy: 10,
        coordinate: { lat: 37.0, lng: 126.9993 },
      },
      locationTick: 1000,
      selectedRouteData: createRoute(),
      systemVolume: 0.7,
      setPassedWaypointIndexes,
      refs,
    };

    const { rerender } = render(<TestHarness {...baseProps} />);

    rerender(
      <TestHarness
        {...baseProps}
        locationMetaData={{
          timestamp: 2000,
          accuracy: 10,
          coordinate: { lat: 37.0, lng: 127.0007 },
        }}
        locationTick={2000}
      />,
    );

    expect(setPassedWaypointIndexes).toHaveBeenCalledWith([0]);
    expect(refs.passedWaypointIdxSetRef.current.has(0)).toBe(true);
    expect(playTts).toHaveBeenCalledWith(
      'tts-waypoint-arrive',
      expect.anything(),
      0.7,
    );
  });

  it('경로 진행도가 경유지 위치를 지나면 반경 판정 누락을 보정한다', () => {
    const refs = createRefs();
    refs.fullPathCoordinateList.current = [
      [126.999, 37.0],
      [127.0, 37.0],
      [127.001, 37.0],
    ];
    refs.instructionList.current = [
      {
        distance: 100,
        time: 30,
        text: '경유지 이후 구간',
        sign: 0,
        interval: [0, 2],
        nextTurnCoordinate: { lat: 37.0, lng: 127.001 },
        ttsUrl: 'https://example.com/tts',
      },
    ];
    const setPassedWaypointIndexes = jest.fn();

    render(
      <TestHarness
        isNavigationMode
        isNavigationInitialized
        locationMetaData={{
          timestamp: 1000,
          accuracy: 10,
          coordinate: { lat: 37.0, lng: 127.0004 },
        }}
        locationTick={1000}
        selectedRouteData={createRoute()}
        systemVolume={0.7}
        setPassedWaypointIndexes={setPassedWaypointIndexes}
        refs={refs}
      />,
    );

    expect(setPassedWaypointIndexes).toHaveBeenCalledWith([0]);
    expect(refs.passedWaypointIdxSetRef.current.has(0)).toBe(true);
  });
});
