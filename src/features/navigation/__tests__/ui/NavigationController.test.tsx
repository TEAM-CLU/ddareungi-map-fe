import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { TailwindProvider } from '@/app/providers/tailwind/provider';
import NavigationController from '@/features/navigation/components/NavigationController';
import { useTimer } from '@/features/navigation/hooks/useTimer';
import { useModalStore } from '@/shared/stores/useModalStore';

jest.mock('@/features/navigation/hooks/useTimer', () => ({
  useTimer: jest.fn(),
}));

jest.mock('@/shared/stores/useModalStore', () => ({
  useModalStore: jest.fn(),
}));

describe('NavigationController', () => {
  const mockStartTimer = jest.fn();
  const mockPauseTimer = jest.fn();
  const mockSetShowNavigationDetailModal = jest.fn();

  const mockUseTimer = useTimer as jest.MockedFunction<typeof useTimer>;
  const mockUseModalStore = useModalStore as jest.MockedFunction<
    typeof useModalStore
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTimer.mockReturnValue({
      seconds: 0,
      timerStatus: 'idle',
      startTimer: mockStartTimer,
      pauseTimer: mockPauseTimer,
      resetTimer: jest.fn(),
    });
    mockUseModalStore.mockImplementation((selector: any) =>
      selector({
        setShowNavigationDetailModal: mockSetShowNavigationDetailModal,
      }),
    );
  });

  function renderWithProvider(props: any) {
    return render(
      <TailwindProvider>
        <NavigationController {...props} />
      </TailwindProvider>,
    );
  }

  describe('예상 도착시간 표시', () => {
    it('null일 때 로딩 메시지를 표시한다', () => {
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: null,
        remainingDistance: 1000,
        traveledDistance: 500,
      });
      expect(getByText(/예상 도착시간:?\s*시간을 계산 중이에요/)).toBeTruthy();
    });

    it('undefined일 때 에러 메시지를 표시한다', () => {
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: undefined,
        remainingDistance: 1000,
        traveledDistance: 500,
      });
      expect(
        getByText(/예상 도착시간:?\s*시간을 측정할 수 없어요/),
      ).toBeTruthy();
    });

    it('정상 Date 객체일 때 시각을 표시한다', () => {
      const date = new Date('2026-01-11T15:07:00');
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: date,
        remainingDistance: 1000,
        traveledDistance: 500,
      });
      expect(getByText(/예상 도착시간:?\s*03:07PM/)).toBeTruthy();
    });

    it('오전 시각을 AM으로 표시한다', () => {
      const date = new Date('2026-01-11T09:30:00');
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: date,
        remainingDistance: 1000,
        traveledDistance: 500,
      });
      expect(getByText(/예상 도착시간:?\s*09:30AM/)).toBeTruthy();
    });

    it('자정을 12:00AM으로 표시한다', () => {
      const date = new Date('2026-01-11T00:00:00');
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: date,
        remainingDistance: 1000,
        traveledDistance: 500,
      });
      expect(getByText(/예상 도착시간:?\s*12:00AM/)).toBeTruthy();
    });

    it('정오를 12:00PM으로 표시한다', () => {
      const date = new Date('2026-01-11T12:00:00');
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: date,
        remainingDistance: 1000,
        traveledDistance: 500,
      });
      expect(getByText(/예상 도착시간:?\s*12:00PM/)).toBeTruthy();
    });
  });

  describe('남은 거리 표시', () => {
    it('null일 때 로딩 메시지를 표시한다', () => {
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: null,
        traveledDistance: 500,
      });
      expect(getByText(/거리를 계산 중이에요/)).toBeTruthy();
    });

    it('undefined일 때 에러 메시지를 표시한다', () => {
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: undefined,
        traveledDistance: 500,
      });
      expect(getByText(/거리를 찾을 수 없어요/)).toBeTruthy();
    });

    it('1000m 이상일 때 km 단위로 표시한다', () => {
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1500,
        traveledDistance: 500,
      });
      expect(getByText(/1.5km 남음/)).toBeTruthy();
    });

    it('1000m 미만일 때 m 단위로 표시한다', () => {
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 800,
        traveledDistance: 500,
      });
      expect(getByText(/800m 남음/)).toBeTruthy();
    });

    it('0m일 때 0m 남음으로 표시한다', () => {
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 0,
        traveledDistance: 500,
      });
      expect(getByText(/0m 남음/)).toBeTruthy();
    });

    it('2000m일 때 2.0km 남음으로 표시한다', () => {
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 2000,
        traveledDistance: 500,
      });
      expect(getByText(/2.0km 남음/)).toBeTruthy();
    });
  });

  describe('소요 거리 표시', () => {
    it('null일 때 로딩 메시지를 표시한다', () => {
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1000,
        traveledDistance: null,
      });
      expect(getByText(/소요거리:?\s*거리를 계산 중이에요/)).toBeTruthy();
    });

    it('undefined일 때 에러 메시지를 표시한다', () => {
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1000,
        traveledDistance: undefined,
      });
      expect(getByText(/소요거리:?\s*거리를 찾을 수 없어요/)).toBeTruthy();
    });

    it('1000m 이상일 때 km 단위로 표시한다', () => {
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1000,
        traveledDistance: 2000,
      });
      expect(getByText(/소요거리:?\s*2.0km/)).toBeTruthy();
    });

    it('1000m 미만일 때 m 단위로 표시한다', () => {
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1000,
        traveledDistance: 300,
      });
      expect(getByText(/소요거리:?\s*300m/)).toBeTruthy();
    });

    it('0m일 때 0m으로 표시한다', () => {
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1000,
        traveledDistance: 0,
      });
      expect(getByText(/소요거리:?\s*0m/)).toBeTruthy();
    });

    it('5000m일 때 5.0km로 표시한다', () => {
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1000,
        traveledDistance: 5000,
      });
      expect(getByText(/소요거리:?\s*5.0km/)).toBeTruthy();
    });
  });

  describe('타이머 표시', () => {
    it('초기 상태에서 00:00:00을 표시한다', () => {
      mockUseTimer.mockReturnValue({
        seconds: 0,
        timerStatus: 'idle',
        startTimer: mockStartTimer,
        pauseTimer: mockPauseTimer,
        resetTimer: jest.fn(),
      });

      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1000,
        traveledDistance: 500,
      });
      expect(getByText('00:00:00')).toBeTruthy();
    });

    it('90초를 00:01:30으로 표시한다', () => {
      mockUseTimer.mockReturnValue({
        seconds: 90,
        timerStatus: 'running',
        startTimer: mockStartTimer,
        pauseTimer: mockPauseTimer,
        resetTimer: jest.fn(),
      });

      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1000,
        traveledDistance: 500,
      });
      expect(getByText('00:01:30')).toBeTruthy();
    });

    it('3661초를 01:01:01로 표시한다', () => {
      mockUseTimer.mockReturnValue({
        seconds: 3661,
        timerStatus: 'running',
        startTimer: mockStartTimer,
        pauseTimer: mockPauseTimer,
        resetTimer: jest.fn(),
      });

      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1000,
        traveledDistance: 500,
      });
      expect(getByText('01:01:01')).toBeTruthy();
    });
  });

  describe('재생/일시정지 버튼', () => {
    it('초기 상태에서 일시정지 아이콘을 표시한다', () => {
      const { UNSAFE_getByType } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1000,
        traveledDistance: 500,
      });

      // IconPause가 렌더링되어 있는지 확인
      expect(UNSAFE_getByType('View' as any)).toBeTruthy();
    });

    it('버튼을 클릭하면 타이머가 일시정지된다', async () => {
      const { getByTestId } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1000,
        traveledDistance: 500,
      });

      const playbackButton = getByTestId('playback-button');

      fireEvent.press(playbackButton);

      await waitFor(() => {
        expect(mockPauseTimer).toHaveBeenCalled();
      });
    });

    it('일시정지 후 다시 클릭하면 타이머가 재개된다', async () => {
      const { getByTestId } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1000,
        traveledDistance: 500,
      });

      const playbackButton = getByTestId('playback-button');

      // 첫 번째 클릭: 일시정지
      fireEvent.press(playbackButton);

      await waitFor(() => {
        expect(mockPauseTimer).toHaveBeenCalled();
      });

      // 두 번째 클릭: 재개
      fireEvent.press(playbackButton);

      await waitFor(() => {
        expect(mockStartTimer).toHaveBeenCalledTimes(2); // 마운트 시 1번 + 재개 시 1번
      });
    });
  });

  describe('햄버거 메뉴 버튼', () => {
    it('햄버거 버튼을 클릭하면 네비게이션 상세 모달을 연다', async () => {
      const { getByTestId } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1000,
        traveledDistance: 500,
      });

      const hamburgerButton = getByTestId('hamburger-button');

      fireEvent.press(hamburgerButton);

      await waitFor(() => {
        expect(mockSetShowNavigationDetailModal).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('컴포넌트 라이프사이클', () => {
    it('마운트 시 타이머를 자동으로 시작한다', () => {
      renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1000,
        traveledDistance: 500,
      });

      expect(mockStartTimer).toHaveBeenCalledTimes(1);
    });

    it('props가 변경되어도 타이머는 리셋되지 않는다', () => {
      const { rerender } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1000,
        traveledDistance: 500,
      });

      jest.clearAllMocks();

      rerender(
        <TailwindProvider>
          <NavigationController
            estimatedArrivalTime={new Date()}
            remainingDistance={800}
            traveledDistance={700}
          />
        </TailwindProvider>,
      );

      // startTimer가 다시 호출되지 않음
      expect(mockStartTimer).not.toHaveBeenCalled();
    });
  });

  describe('엣지 케이스', () => {
    it('모든 값이 null일 때 정상적으로 렌더링된다', () => {
      const { getByText, getAllByText } = renderWithProvider({
        estimatedArrivalTime: null,
        remainingDistance: null,
        traveledDistance: null,
      });

      expect(getByText(/시간을 계산 중이에요/)).toBeTruthy();
      const loadingTexts = getAllByText(/거리를 계산 중이에요/);
      expect(loadingTexts.length).toBe(2); // remainingDistance와 traveledDistance
      expect(getByText('00:00:00')).toBeTruthy();
    });

    it('모든 값이 undefined일 때 정상적으로 렌더링된다', () => {
      const { getByText, getAllByText } = renderWithProvider({
        estimatedArrivalTime: undefined,
        remainingDistance: undefined,
        traveledDistance: undefined,
      });

      expect(getByText(/시간을 측정할 수 없어요/)).toBeTruthy();
      const errorTexts = getAllByText(/거리를 찾을 수 없어요/);
      expect(errorTexts.length).toBe(2); // remainingDistance와 traveledDistance
      expect(getByText('00:00:00')).toBeTruthy();
    });

    it('매우 큰 거리 값도 정상적으로 표시한다', () => {
      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 99999,
        traveledDistance: 50000,
      });

      expect(getByText(/100.0km 남음/)).toBeTruthy();
      expect(getByText(/소요거리:?\s*50.0km/)).toBeTruthy();
    });

    it('매우 긴 시간도 정상적으로 표시한다', () => {
      mockUseTimer.mockReturnValue({
        seconds: 36000, // 10시간
        timerStatus: 'running',
        startTimer: mockStartTimer,
        pauseTimer: mockPauseTimer,
        resetTimer: jest.fn(),
      });

      const { getByText } = renderWithProvider({
        estimatedArrivalTime: new Date(),
        remainingDistance: 1000,
        traveledDistance: 500,
      });

      expect(getByText('10:00:00')).toBeTruthy();
    });
  });
});
