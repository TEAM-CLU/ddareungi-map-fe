import { useTimer } from '@/features/navigation/hooks/useTimer';
import { IconHamburger, IconPause, IconPlay } from '@/shared/components/icons';
import { tw } from '@/shared/libs/tw-helper';
import { useModalStore } from '@/shared/stores/useModalStore';
import {
  formatTimeHHMMSS,
  getDistanceText,
  getTimeText,
} from '@/shared/utils/formatting';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface NavigationControllerProps {
  estimatedArrivalTime: Date | null | undefined;
  remainingDistance: number | null | undefined;
  traveledDistance: number | null | undefined;
}

const NavigationController = ({
  estimatedArrivalTime,
  remainingDistance,
  traveledDistance,
}: NavigationControllerProps) => {
  const setShowNavigationDetailModal = useModalStore(
    state => state.setShowNavigationDetailModal,
  );

  const { seconds, startTimer, pauseTimer } = useTimer();

  const [playbackStatus, setPlaybackStatus] = useState<'playing' | 'paused'>(
    'playing',
  );

  const handlePlayBackTogglePress = () => {
    if (playbackStatus === 'playing') {
      setPlaybackStatus('paused');
      pauseTimer();
      return;
    }
    if (playbackStatus === 'paused') {
      setPlaybackStatus('playing');
      startTimer();
      return;
    }
  };

  useEffect(() => {
    startTimer();
  }, [startTimer]);

  return (
    <View
      style={[
        tw('flex flex-row items-center w-full bg-surface-primary shadow-md'),
        {
          gap: 14,
          maxWidth: 375,
          borderRadius: 20,
          paddingHorizontal: 22,
          paddingVertical: 11,
        },
        { height: 122 },
      ]}
    >
      <TouchableOpacity
        onPress={handlePlayBackTogglePress}
        style={tw(
          'bg-brand-primary flex items-center justify-center w-12 h-12 rounded-full relative',
        )}
      >
        <View
          style={[
            tw('flex items-center justify-center w-full h-full absolute'),
            {
              left: '51%',
              transform: [{ translateX: -24 }],
            },
          ]}
        >
          {playbackStatus === 'playing' ? (
            <IconPause color="#ffffff" />
          ) : (
            <IconPlay />
          )}
        </View>
      </TouchableOpacity>
      <View style={[tw('h-full'), { backgroundColor: '#E2E2E2', width: 1 }]} />
      <View
        style={[
          tw('flex flex-col justify-between items-start w-full flex-1'),
          { gap: 8 },
        ]}
      >
        <View style={tw('w-full flex flex-row justify-between items-center')}>
          <Text
            style={[
              tw('font-primary-600 text-on-surface-primary'),
              { fontSize: 13 },
            ]}
          >
            예상 도착시간: {getTimeText(estimatedArrivalTime)}
          </Text>
          <TouchableOpacity onPress={() => setShowNavigationDetailModal(true)}>
            <IconHamburger />
          </TouchableOpacity>
        </View>
        <Text
          style={[
            tw('font-primary-600 text-on-surface-primary text-left'),
            { fontSize: 24 },
          ]}
        >
          {formatTimeHHMMSS(seconds)}
        </Text>
        <View style={[tw('w-full flex flex-col items-start'), { gap: 4 }]}>
          <Text
            style={[
              tw('font-primary-500 text-brand-primary text-left'),
              { fontSize: 15 },
            ]}
          >
            {remainingDistance !== null && remainingDistance !== undefined
              ? getDistanceText(remainingDistance) + ' 남음'
              : getDistanceText(remainingDistance)}
          </Text>
          <Text
            style={[
              tw('font-primary-500 text-on-surface-primary text-left'),
              { fontSize: 13 },
            ]}
          >
            소요거리: {getDistanceText(traveledDistance)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default NavigationController;
