import React, { useEffect, useRef, useState } from 'react';
import { Image, ImageStyle, Text, TouchableOpacity, View } from 'react-native';

import {
  DIRECTION_ICONS,
  FALLBACK_TTS_URL,
} from '@/features/navigation/model/navigation.constants';
import { useNavDetailModalStore } from '@/features/navigation/stores/useNavDetailModalStore';
import { tw } from '@/shared/libs/tw-helper';
import TrackPlayer from 'react-native-track-player';
import { globalTtsState } from '@/features/navigation/model/navigation.data';

interface InstructionBannerProps {
  currentIntervalIndex: number;
  instructionText: string;
  currentTtsUrl: string | null;
  sign: number;
}

const InstructionBanner = ({
  currentIntervalIndex,
  instructionText,
  currentTtsUrl,
  sign,
}: InstructionBannerProps) => {
  const instructionLines = React.useMemo(() => {
    const words = (instructionText ?? '').trim().split(/\s+/).filter(Boolean);
    const result: string[] = [];
    for (let i = 0; i < words.length; i += 3) {
      result.push(words.slice(i, i + 3).join(' '));
    }
    return result;
  }, [instructionText, sign]);
  const navVolume = useNavDetailModalStore(state => state.navVolume);
  const prevIntervalIndexRef = useRef<number>(-1);

  // TTS 재생 처리
  useEffect(() => {
    // 중복 재생을 막기 위함
    if (currentIntervalIndex === prevIntervalIndexRef.current) return;
    prevIntervalIndexRef.current = currentIntervalIndex;
    const playKey = `tts-${currentIntervalIndex}`;
    if (playKey === globalTtsState.lastPlayedKey) return;
    globalTtsState.lastPlayedKey = playKey;

    const playTts = async () => {
      const ttsUrlToPlay = currentTtsUrl ?? FALLBACK_TTS_URL;
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: playKey,
        url: ttsUrlToPlay,
        title: 'Navigation Instruction',
        artist: 'Ddarungi Map',
      });
      await TrackPlayer.setVolume(navVolume);
      await TrackPlayer.play();
    };

    playTts();
  }, [currentIntervalIndex, currentTtsUrl]);

  const handleInstructionBannerPress = async () => {
    const ttsUrlToPlay = currentTtsUrl ?? FALLBACK_TTS_URL;
    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: `tts-${currentIntervalIndex}`,
      url: ttsUrlToPlay,
      title: 'Navigation Instruction',
      artist: 'Ddarungi Map',
    });
    await TrackPlayer.setVolume(navVolume);
    await TrackPlayer.play();
  };

  return (
    <TouchableOpacity
      onPress={handleInstructionBannerPress}
      style={[
        tw(
          'w-full flex flex-row items-center px-1 py-2 bg-brand-primary justify-start',
        ),
        { borderRadius: 20, maxWidth: 348, height: 70, gap: 1 },
      ]}
    >
      <View style={[(tw('flex flex-col justify-center'), { gap: 2 })]}>
        <Image
          source={DIRECTION_ICONS[String(sign) as keyof typeof DIRECTION_ICONS]}
          style={{ width: 50, height: 50 } as ImageStyle}
          resizeMode="cover"
          testID="direction-icon"
        />
      </View>
      <Text
        style={[
          tw('font-primary-600 text-on-surface-secondary'),
          { fontSize: 14 },
        ]}
      ></Text>
      <View style={[tw('flex flex-col justify-center'), { gap: 2 }]}>
        {instructionLines.map((line, idx) => (
          <Text
            key={`${idx}-${line}`}
            style={[
              tw('font-primary-700 text-on-surface-secondary'),
              { fontSize: 18 },
            ]}
          >
            {line}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
};

export default InstructionBanner;
