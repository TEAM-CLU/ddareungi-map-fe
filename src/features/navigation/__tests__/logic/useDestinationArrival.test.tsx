import React from 'react';
import { render } from '@testing-library/react-native';
import { useDestinationArrival } from '@/features/navigation/hooks/useDestinationArrival';
import { NavigationInstruction } from '@/features/navigation/model/navigation.types';

jest.mock('@/features/navigation/utils/navigationQaLog', () => ({
  writeNavigationQaLog: jest.fn(),
}));

jest.mock('@/features/navigation/hooks/useTimer', () => ({
  clearSharedTimer: jest.fn(),
}));

type TestProps = Parameters<typeof useDestinationArrival>[0];

const TestHarness = (props: TestProps) => {
  useDestinationArrival(props);
  return null;
};

const makeInstruction = (
  text: string,
  interval: [number, number],
): NavigationInstruction => ({
  distance: 100,
  time: 30,
  text,
  sign: 0,
  interval,
  nextTurnCoordinate: { lat: 37.0, lng: 127.0 },
  ttsUrl: `https://example.com/tts/${text}`,
});

describe('useDestinationArrival', () => {
  it('마지막 인터벌에서 도착 거리가 2틱 연속 확인되면 정상 종료로 전환한다', () => {
    const setIsNavigationMode = jest.fn();
    const setTimerStatus = jest.fn();
    const setShowNavigationEndModal = jest.fn();
    const setShowNavigationFinishModal = jest.fn();

    const refs = {
      currentIntervalIndex: { current: 1 },
      instructionList: {
        current: [
          makeInstruction('첫 구간', [0, 1]),
          makeInstruction('도착', [2, 3]),
        ],
      },
    };

    const baseProps: TestProps = {
      isNavigationMode: true,
      isNavigationInitialized: true,
      locationMetaData: {
        timestamp: 1000,
        accuracy: 10,
        coordinate: { lat: 37.5665, lng: 126.978 },
      },
      locationTick: 1000,
      remainingDistanceMeter: 4,
      setIsNavigationMode,
      setTimerStatus,
      setShowNavigationEndModal,
      setShowNavigationFinishModal,
      refs,
    };

    const { rerender } = render(<TestHarness {...baseProps} />);

    expect(setShowNavigationFinishModal).not.toHaveBeenCalled();

    rerender(
      <TestHarness
        {...baseProps}
        locationMetaData={{
          timestamp: 2000,
          accuracy: 10,
          coordinate: { lat: 37.56651, lng: 126.97801 },
        }}
        locationTick={2000}
      />,
    );

    expect(setShowNavigationEndModal).toHaveBeenCalledWith(false);
    expect(setShowNavigationFinishModal).toHaveBeenCalledWith(true);
    expect(setIsNavigationMode).toHaveBeenCalledWith(false);
    expect(setTimerStatus).toHaveBeenCalledWith('paused');
  });

  it('마지막 인터벌이 아니면 도착 거리여도 정상 종료로 전환하지 않는다', () => {
    const setIsNavigationMode = jest.fn();
    const setTimerStatus = jest.fn();
    const setShowNavigationEndModal = jest.fn();
    const setShowNavigationFinishModal = jest.fn();

    const refs = {
      currentIntervalIndex: { current: 0 },
      instructionList: {
        current: [
          makeInstruction('첫 구간', [0, 1]),
          makeInstruction('도착', [2, 3]),
        ],
      },
    };

    render(
      <TestHarness
        isNavigationMode={true}
        isNavigationInitialized={true}
        locationMetaData={{
          timestamp: 1000,
          accuracy: 10,
          coordinate: { lat: 37.5665, lng: 126.978 },
        }}
        locationTick={1000}
        remainingDistanceMeter={3}
        setIsNavigationMode={setIsNavigationMode}
        setTimerStatus={setTimerStatus}
        setShowNavigationEndModal={setShowNavigationEndModal}
        setShowNavigationFinishModal={setShowNavigationFinishModal}
        refs={refs}
      />,
    );

    expect(setShowNavigationFinishModal).not.toHaveBeenCalled();
    expect(setIsNavigationMode).not.toHaveBeenCalled();
  });

  it('마지막 직전 인터벌에서 목적지 좌표가 가까우면 정상 종료로 전환한다', () => {
    const setIsNavigationMode = jest.fn();
    const setTimerStatus = jest.fn();
    const setShowNavigationEndModal = jest.fn();
    const setShowNavigationFinishModal = jest.fn();

    const refs = {
      currentIntervalIndex: { current: 1 },
      instructionList: {
        current: [
          makeInstruction('첫 구간', [0, 1]),
          makeInstruction('마지막 전 구간', [2, 3]),
          makeInstruction('도착', [4, 5]),
        ],
      },
    };
    refs.instructionList.current[2].nextTurnCoordinate = {
      lat: 37.5665,
      lng: 126.978,
    };

    render(
      <TestHarness
        isNavigationMode={true}
        isNavigationInitialized={true}
        locationMetaData={{
          timestamp: 1000,
          accuracy: 10,
          coordinate: { lat: 37.56651, lng: 126.97801 },
        }}
        locationTick={1000}
        remainingDistanceMeter={20}
        setIsNavigationMode={setIsNavigationMode}
        setTimerStatus={setTimerStatus}
        setShowNavigationEndModal={setShowNavigationEndModal}
        setShowNavigationFinishModal={setShowNavigationFinishModal}
        refs={refs}
      />,
    );

    expect(setShowNavigationEndModal).toHaveBeenCalledWith(false);
    expect(setShowNavigationFinishModal).toHaveBeenCalledWith(true);
    expect(setIsNavigationMode).toHaveBeenCalledWith(false);
    expect(setTimerStatus).toHaveBeenCalledWith('paused');
  });
});
