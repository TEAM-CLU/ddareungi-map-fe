import React from 'react';
import { render } from '@testing-library/react-native';
import { useTurnController } from '@/features/navigation/hooks/useTurnController';
import { NavigationInstruction } from '@/features/navigation/model/navigation.types';

jest.mock('@/features/navigation/utils/calculateMotionVector', () => ({
  calculateMotionVector: jest.fn(() => ({
    moveMag: 20,
    speedMps: 5,
    dot: -1,
  })),
}));

type TestProps = Parameters<typeof useTurnController>[0];

const TestHarness = (props: TestProps) => {
  useTurnController(props);
  return null;
};

const makeInstruction = (
  text: string,
  interval: [number, number],
  nextTurnCoordinate: { lat: number; lng: number },
): NavigationInstruction => ({
  distance: 100,
  time: 30,
  text,
  sign: 0,
  interval,
  nextTurnCoordinate,
  ttsUrl: `https://example.com/tts/${text}`,
});

const createRefs = (instructionList: NavigationInstruction[]) => ({
  nextTurnCoordinate: { current: instructionList[0].nextTurnCoordinate },
  currentIntervalIndex: { current: 0 },
  instructionList: { current: instructionList },
  currentTtsUrl: { current: null as string | null },
  previewInstructionText: { current: '' },
  previewTtsUrl: { current: null as string | null },
  previewSign: { current: null as number | null },
  isEnteredRef: { current: false },
  passCountRef: { current: 0 },
  lastDistanceFromMyPosToNextTurnPosRef: { current: null as number | null },
  prevMyPositionForTurnRef: {
    current: null as { lat: number; lng: number } | null,
  },
  prevTimestampForTurnRef: { current: null as number | null },
  previewEnterCount: { current: 0 },
  currentLocationMetaData: {
    current: {
      timestamp: 1000,
      accuracy: 10,
      coordinate: { lat: 37.0, lng: 127.0003 },
    },
  },
});

describe('useTurnController interval 판정', () => {
  it('멀어짐 후보가 3회 누적되면 다음 인터벌로 진행한다', () => {
    const instructionList = [
      makeInstruction('첫 구간', [0, 1], { lat: 37.0, lng: 127.0 }),
      makeInstruction('둘째 구간', [2, 3], { lat: 37.001, lng: 127.001 }),
      makeInstruction('셋째 구간', [4, 5], { lat: 37.002, lng: 127.002 }),
    ];
    const refs = createRefs(instructionList);
    const setCurrentInstruction = jest.fn();

    const baseProps: TestProps = {
      isNavigationMode: true,
      isNavigationInitialized: true,
      locationMetaData: refs.currentLocationMetaData.current,
      currentInstruction: instructionList[0],
      setCurrentInstruction,
      refs,
    };

    const { rerender } = render(<TestHarness {...baseProps} />);

    // 1) entry
    refs.currentLocationMetaData.current = {
      timestamp: 2000,
      accuracy: 10,
      coordinate: { lat: 37.0, lng: 127.0003 },
    };
    rerender(
      <TestHarness
        {...baseProps}
        locationMetaData={refs.currentLocationMetaData.current}
      />,
    );

    // 2) passed 후보 1회
    refs.currentLocationMetaData.current = {
      timestamp: 3000,
      accuracy: 10,
      coordinate: { lat: 37.0, lng: 127.0004 },
    };
    rerender(
      <TestHarness
        {...baseProps}
        locationMetaData={refs.currentLocationMetaData.current}
      />,
    );

    // 3) passed 후보 2회
    refs.currentLocationMetaData.current = {
      timestamp: 4000,
      accuracy: 10,
      coordinate: { lat: 37.0, lng: 127.0005 },
    };
    rerender(
      <TestHarness
        {...baseProps}
        locationMetaData={refs.currentLocationMetaData.current}
      />,
    );

    // 4) passed 후보 3회 -> 다음 인터벌 확정
    refs.currentLocationMetaData.current = {
      timestamp: 5000,
      accuracy: 10,
      coordinate: { lat: 37.0, lng: 127.0006 },
    };
    rerender(
      <TestHarness
        {...baseProps}
        locationMetaData={refs.currentLocationMetaData.current}
      />,
    );

    expect(setCurrentInstruction).toHaveBeenCalledWith(instructionList[1]);
    expect(refs.currentIntervalIndex.current).toBe(1);
    expect(refs.nextTurnCoordinate.current).toEqual(
      instructionList[1].nextTurnCoordinate,
    );
    expect(refs.previewInstructionText.current).toBe(instructionList[2].text);
    expect(refs.previewTtsUrl.current).toBe(instructionList[2].ttsUrl);
    expect(refs.previewSign.current).toBe(instructionList[2].sign);
    expect(refs.isEnteredRef.current).toBe(false);
    expect(refs.passCountRef.current).toBe(0);
  });

  it('후보가 2회 이하면 인터벌이 유지된다', () => {
    const instructionList = [
      makeInstruction('첫 구간', [0, 1], { lat: 37.0, lng: 127.0 }),
      makeInstruction('둘째 구간', [2, 3], { lat: 37.001, lng: 127.001 }),
    ];
    const refs = createRefs(instructionList);
    const setCurrentInstruction = jest.fn();

    const baseProps: TestProps = {
      isNavigationMode: true,
      isNavigationInitialized: true,
      locationMetaData: refs.currentLocationMetaData.current,
      currentInstruction: instructionList[0],
      setCurrentInstruction,
      refs,
    };

    const { rerender } = render(<TestHarness {...baseProps} />);

    refs.currentLocationMetaData.current = {
      timestamp: 2000,
      accuracy: 10,
      coordinate: { lat: 37.0, lng: 127.0003 },
    };
    rerender(
      <TestHarness
        {...baseProps}
        locationMetaData={refs.currentLocationMetaData.current}
      />,
    );

    refs.currentLocationMetaData.current = {
      timestamp: 3000,
      accuracy: 10,
      coordinate: { lat: 37.0, lng: 127.0004 },
    };
    rerender(
      <TestHarness
        {...baseProps}
        locationMetaData={refs.currentLocationMetaData.current}
      />,
    );

    refs.currentLocationMetaData.current = {
      timestamp: 4000,
      accuracy: 10,
      coordinate: { lat: 37.0, lng: 127.0005 },
    };
    rerender(
      <TestHarness
        {...baseProps}
        locationMetaData={refs.currentLocationMetaData.current}
      />,
    );

    expect(setCurrentInstruction).not.toHaveBeenCalled();
    expect(refs.currentIntervalIndex.current).toBe(0);
  });
});
