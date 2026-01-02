import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import InstructionBanner from '@/features/navigation/components/InstructionBanner';
import { TailwindProvider } from '@/app/providers/tailwind/provider';
import TrackPlayer from 'react-native-track-player';
import { FALLBACK_TTS_URL } from '@/features/navigation/model/navigation.constants';
import { globalTtsState } from '@/features/navigation/model/navigation.data';

jest.mock('react-native-track-player', () => ({
  __esModule: true,
  default: {
    reset: jest.fn(),
    add: jest.fn(),
    setVolume: jest.fn(),
    play: jest.fn(),
  },
}));

function renderWithProvider(ui: React.ReactElement) {
  return render(<TailwindProvider>{ui}</TailwindProvider>);
}

describe('InstructionBanner', () => {
  const mockTrackPlayer = TrackPlayer as jest.Mocked<typeof TrackPlayer>;

  beforeEach(() => {
    jest.clearAllMocks();
    globalTtsState.lastPlayedKey = '';
  });

  it('renders instruction text split into lines', () => {
    const { getByText } = renderWithProvider(
      <InstructionBanner
        currentIntervalIndex={0}
        instruction="좌회전 후 100m 직진하세요"
        currentTtsUrl={null}
        sign={1}
      />,
    );
    expect(getByText('좌회전 후 100m')).toBeTruthy();
    expect(getByText('직진하세요')).toBeTruthy();
  });

  it('renders direction icon', () => {
    const { getByTestId } = renderWithProvider(
      <InstructionBanner
        currentIntervalIndex={0}
        instruction="우회전 후 200m 직진"
        currentTtsUrl={null}
        sign={2}
      />,
    );
    expect(getByTestId('direction-icon')).toBeTruthy();
  });

  it('plays fallback TTS when interval changes', async () => {
    renderWithProvider(
      <InstructionBanner
        currentIntervalIndex={0}
        instruction="직진하세요"
        currentTtsUrl={null}
        sign={0}
      />,
    );

    await waitFor(() => {
      expect(mockTrackPlayer.reset).toHaveBeenCalled();
    });

    expect(mockTrackPlayer.add).toHaveBeenCalledWith({
      id: 'tts-0',
      url: FALLBACK_TTS_URL,
      title: 'Navigation Instruction',
      artist: 'Ddarungi Map',
    });
    expect(mockTrackPlayer.setVolume).toHaveBeenCalled();
    expect(mockTrackPlayer.play).toHaveBeenCalled();
  });

  it('plays provided TTS on banner press', async () => {
    globalTtsState.lastPlayedKey = 'tts-0';
    const ttsUrl = 'https://example.com/tts.mp3';

    const { getByTestId } = renderWithProvider(
      <InstructionBanner
        currentIntervalIndex={0}
        instruction="좌회전"
        currentTtsUrl={ttsUrl}
        sign={-1}
      />,
    );

    jest.clearAllMocks();
    const touchable = getByTestId('direction-icon').parent as any;
    fireEvent.press(touchable);

    await waitFor(() => {
      expect(mockTrackPlayer.reset).toHaveBeenCalled();
    });
    expect(mockTrackPlayer.add).toHaveBeenCalledWith({
      id: 'tts-0',
      url: ttsUrl,
      title: 'Navigation Instruction',
      artist: 'Ddarungi Map',
    });
    expect(mockTrackPlayer.play).toHaveBeenCalled();
  });
});
