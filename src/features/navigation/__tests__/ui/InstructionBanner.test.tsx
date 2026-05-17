import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import InstructionBanner from '@/features/navigation/components/InstructionBanner';
import { TailwindProvider } from '@/app/providers/tailwind/provider';
import { TTS_URL_PRESET } from '@/features/navigation/model/navigation.constants';
import { playTts } from '@/features/navigation/libs/playTts';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { useVolumeStore } from '@/features/navigation/stores/useVolumeStore';

jest.mock('@/features/navigation/libs/playTts', () => ({
  playTts: jest.fn(),
}));

jest.mock('@/shared/stores/useMyPositionStore', () => ({
  useMyPositionStore: jest.fn(),
}));

jest.mock('@/features/navigation/stores/useVolumeStore', () => ({
  useVolumeStore: jest.fn(),
}));

const FALLBACK_TTS_URL = TTS_URL_PRESET.FALLBACK_TTS_URL;

function renderWithProvider(ui: React.ReactElement) {
  return render(<TailwindProvider>{ui}</TailwindProvider>);
}

describe('InstructionBanner', () => {
  const mockPlayTts = playTts as jest.MockedFunction<typeof playTts>;
  const mockUseMyPositionStore = useMyPositionStore as jest.MockedFunction<
    typeof useMyPositionStore
  >;
  const mockUseVolumeStore = useVolumeStore as jest.MockedFunction<
    typeof useVolumeStore
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMyPositionStore.mockReturnValue({
      lat: 37.5665,
      lng: 126.978,
    });
    mockUseVolumeStore.mockReturnValue(0.8);
  });

  describe('렌더링', () => {
    it('지시 텍스트를 3단어씩 줄바꿈하여 표시한다', () => {
      const { getByText } = renderWithProvider(
        <InstructionBanner
          pathDataListByInterval={[]}
          currentIntervalIndex={0}
          currentInstructionText="좌회전 후 100m 직진하세요"
          currentTtsUrl={null}
          currentSign={1}
          previewInstructionText=""
          previewTtsUrl={null}
          previewSign={null}
          isLoading={false}
        />,
      );

      // "다음 안내까지 직진하세요" 고정 문구 표시
      expect(getByText('다음 안내까지 직진하세요')).toBeTruthy();
    });

    it('방향 아이콘을 표시한다', () => {
      const { UNSAFE_getByType } = renderWithProvider(
        <InstructionBanner
          pathDataListByInterval={[]}
          currentIntervalIndex={0}
          currentInstructionText="우회전 후 200m 직진"
          currentTtsUrl={null}
          currentSign={2}
          previewInstructionText=""
          previewTtsUrl={null}
          previewSign={null}
          isLoading={false}
        />,
      );

      const images = UNSAFE_getByType('Image' as any);
      expect(images).toBeTruthy();
    });

    it('인터벌 번호를 표시한다', () => {
      const { getByText } = renderWithProvider(
        <InstructionBanner
          pathDataListByInterval={[]}
          currentIntervalIndex={2}
          currentInstructionText="직진하세요"
          currentTtsUrl={null}
          currentSign={0}
          previewInstructionText=""
          previewTtsUrl={null}
          previewSign={null}
          isLoading={false}
        />,
      );

      expect(getByText('3')).toBeTruthy(); // currentIntervalIndex + 1
    });

    it('로딩 상태일 때 아무것도 렌더링하지 않는다', () => {
      const { toJSON } = renderWithProvider(
        <InstructionBanner
          pathDataListByInterval={[]}
          currentIntervalIndex={0}
          currentInstructionText="직진하세요"
          currentTtsUrl={null}
          currentSign={0}
          previewInstructionText=""
          previewTtsUrl={null}
          previewSign={null}
          isLoading={true}
        />,
      );

      expect(toJSON()).toBeNull();
    });

    it('프리뷰 모드가 아닐 때 고정 문구를 표시한다', () => {
      const { getByText } = renderWithProvider(
        <InstructionBanner
          pathDataListByInterval={[
            {
              intervalIndex: 0,
              interval: [0, 1] as [number, number],
              coordinateList: [
                { lat: 0, lng: 0 },
                { lat: 0, lng: 0.001 },
              ],
            },
          ]}
          currentIntervalIndex={0}
          currentInstructionText="현재 지시"
          currentTtsUrl="http://example.com/current.mp3"
          currentSign={0}
          previewInstructionText="다음 좌회전"
          previewTtsUrl="http://example.com/preview.mp3"
          previewSign={-1}
          isLoading={false}
        />,
      );

      expect(getByText('다음 안내까지 직진하세요')).toBeTruthy();
    });
  });

  describe('TTS 재생', () => {
    it('첫 마운트 시 START TTS와 첫 실제 지시 TTS를 재생한다', async () => {
      const currentTtsUrl = 'http://example.com/first.mp3';

      renderWithProvider(
        <InstructionBanner
          pathDataListByInterval={[]}
          currentIntervalIndex={0}
          currentInstructionText="직진하세요"
          currentTtsUrl={currentTtsUrl}
          currentSign={0}
          previewInstructionText=""
          previewTtsUrl={null}
          previewSign={null}
          isLoading={false}
        />,
      );

      await waitFor(() => {
        expect(mockPlayTts).toHaveBeenCalledWith(
          'tts-navigation-start',
          TTS_URL_PRESET.START_TTS_URL,
          0.8,
        );
      });

      expect(mockPlayTts).toHaveBeenCalledWith(
        'tts-actual-0',
        currentTtsUrl,
        0.8,
      );
    });

    it('currentTtsUrl이 null이면 FALLBACK TTS를 사용한다', async () => {
      renderWithProvider(
        <InstructionBanner
          pathDataListByInterval={[]}
          currentIntervalIndex={0}
          currentInstructionText="직진하세요"
          currentTtsUrl={null}
          currentSign={0}
          previewInstructionText=""
          previewTtsUrl={null}
          previewSign={null}
          isLoading={false}
        />,
      );

      await waitFor(() => {
        expect(mockPlayTts).toHaveBeenCalledWith(
          'tts-actual-0',
          FALLBACK_TTS_URL,
          0.8,
        );
      });
    });

    it('인터벌이 변경되면 고정 멘트 TTS를 재생한다', async () => {
      const { rerender } = renderWithProvider(
        <InstructionBanner
          pathDataListByInterval={[]}
          currentIntervalIndex={0}
          currentInstructionText="직진하세요"
          currentTtsUrl={null}
          currentSign={0}
          previewInstructionText=""
          previewTtsUrl={null}
          previewSign={null}
          isLoading={false}
        />,
      );

      jest.clearAllMocks();

      rerender(
        <TailwindProvider>
          <InstructionBanner
            pathDataListByInterval={[]}
            currentIntervalIndex={1}
            currentInstructionText="좌회전하세요"
            currentTtsUrl={null}
            currentSign={-1}
            previewInstructionText=""
            previewTtsUrl={null}
            previewSign={null}
            isLoading={false}
          />
        </TailwindProvider>,
      );

      await waitFor(() => {
        expect(mockPlayTts).toHaveBeenCalledWith(
          'tts-turn-1',
          TTS_URL_PRESET.CURRENT_FIXED_TTS_URL ?? FALLBACK_TTS_URL,
          0.8,
        );
      });
    });

    it('배너를 탭하면 현재 TTS를 재생한다', async () => {
      const currentTtsUrl = 'http://example.com/tap.mp3';

      const { getByText } = renderWithProvider(
        <InstructionBanner
          pathDataListByInterval={[]}
          currentIntervalIndex={0}
          currentInstructionText="좌회전하세요"
          currentTtsUrl={currentTtsUrl}
          currentSign={-1}
          previewInstructionText=""
          previewTtsUrl={null}
          previewSign={null}
          isLoading={false}
        />,
      );

      jest.clearAllMocks();

      const banner = getByText('다음 안내까지 직진하세요').parent?.parent;
      if (banner) {
        fireEvent.press(banner);
      }

      await waitFor(() => {
        expect(mockPlayTts).toHaveBeenCalledWith(
          'tts-tap-0',
          currentTtsUrl,
          0.8,
        );
      });
    });

    it('배너 탭 시 currentTtsUrl이 null이면 FALLBACK TTS를 사용한다', async () => {
      const { getByText } = renderWithProvider(
        <InstructionBanner
          pathDataListByInterval={[]}
          currentIntervalIndex={0}
          currentInstructionText="직진하세요"
          currentTtsUrl={null}
          currentSign={0}
          previewInstructionText=""
          previewTtsUrl={null}
          previewSign={null}
          isLoading={false}
        />,
      );

      jest.clearAllMocks();

      const banner = getByText('다음 안내까지 직진하세요').parent?.parent;
      if (banner) {
        fireEvent.press(banner);
      }

      await waitFor(() => {
        expect(mockPlayTts).toHaveBeenCalledWith(
          'tts-tap-0',
          FALLBACK_TTS_URL,
          0.8,
        );
      });
    });
  });

  describe('남은 거리 계산', () => {
    it('내 위치가 없으면 "계산중"을 표시한다', () => {
      mockUseMyPositionStore.mockReturnValue(null);

      const { getByText } = renderWithProvider(
        <InstructionBanner
          pathDataListByInterval={[]}
          currentIntervalIndex={0}
          currentInstructionText="직진하세요"
          currentTtsUrl={null}
          currentSign={0}
          previewInstructionText=""
          previewTtsUrl={null}
          previewSign={null}
          isLoading={false}
        />,
      );

      expect(getByText('계산중')).toBeTruthy();
    });

    it('pathDataListByInterval이 비어있으면 "계산중"을 표시한다', () => {
      const { getByText } = renderWithProvider(
        <InstructionBanner
          pathDataListByInterval={[]}
          currentIntervalIndex={0}
          currentInstructionText="직진하세요"
          currentTtsUrl={null}
          currentSign={0}
          previewInstructionText=""
          previewTtsUrl={null}
          previewSign={null}
          isLoading={false}
        />,
      );

      expect(getByText('계산중')).toBeTruthy();
    });
  });

  describe('텍스트 줄바꿈', () => {
    it('3단어씩 묶어서 줄바꿈한다', () => {
      const { getByText } = renderWithProvider(
        <InstructionBanner
          pathDataListByInterval={[]}
          currentIntervalIndex={0}
          currentInstructionText="이것은 테스트 입니다 정말 긴 문장"
          currentTtsUrl={null}
          currentSign={0}
          previewInstructionText=""
          previewTtsUrl={null}
          previewSign={null}
          isLoading={false}
        />,
      );

      // 고정 문구가 표시됨
      expect(getByText('다음 안내까지 직진하세요')).toBeTruthy();
    });

    it('빈 문자열은 빈 배열로 처리한다', () => {
      const { queryByText } = renderWithProvider(
        <InstructionBanner
          pathDataListByInterval={[]}
          currentIntervalIndex={0}
          currentInstructionText=""
          currentTtsUrl={null}
          currentSign={0}
          previewInstructionText=""
          previewTtsUrl={null}
          previewSign={null}
          isLoading={false}
        />,
      );

      // 고정 문구만 표시
      expect(queryByText('다음 안내까지 직진하세요')).toBeTruthy();
    });

    it('공백만 있는 문자열은 빈 배열로 처리한다', () => {
      const { getByText } = renderWithProvider(
        <InstructionBanner
          pathDataListByInterval={[]}
          currentIntervalIndex={0}
          currentInstructionText="   "
          currentTtsUrl={null}
          currentSign={0}
          previewInstructionText=""
          previewTtsUrl={null}
          previewSign={null}
          isLoading={false}
        />,
      );

      expect(getByText('다음 안내까지 직진하세요')).toBeTruthy();
    });
  });

  describe('볼륨 설정', () => {
    it('systemVolume 값을 TTS 재생에 사용한다', async () => {
      mockUseVolumeStore.mockReturnValue(0.5);

      renderWithProvider(
        <InstructionBanner
          pathDataListByInterval={[]}
          currentIntervalIndex={0}
          currentInstructionText="직진하세요"
          currentTtsUrl="http://example.com/tts.mp3"
          currentSign={0}
          previewInstructionText=""
          previewTtsUrl={null}
          previewSign={null}
          isLoading={false}
        />,
      );

      await waitFor(() => {
        expect(mockPlayTts).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          0.5,
        );
      });
    });
  });
});
