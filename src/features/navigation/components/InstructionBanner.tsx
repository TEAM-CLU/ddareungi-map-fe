import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, ImageStyle, Text, TouchableOpacity, View } from 'react-native';

import {
  DIRECTION_ICONS,
  INTERVAL_DISTANCE_OPTIONS,
  MOTION_COMMON_OPTIONS,
  TTS_URL_PRESET,
} from '@/features/navigation/model/navigation.constants';
import { tw } from '@/shared/libs/tw-helper';
import TrackPlayer from 'react-native-track-player';
import { globalTtsState } from '@/features/navigation/model/navigation.data';
import { IntervalPathData } from '@/features/navigation/model/navigation.types';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { calculateIntervalDistanceByMyPosition } from '@/features/navigation/utils/navigationController';
import { formatDistanceAdaptive } from '@/shared/utils/formatting';
import { useVolumeStore } from '@/features/navigation/stores/useVolumeStore';
import { playTts } from '@/features/navigation/utils/playTts';

interface InstructionBannerProps {
  pathDataListByInterval: IntervalPathData[];
  currentIntervalIndex: number;
  instructionText: string;
  currentTtsUrl: string | null;
  sign: number;
}

const InstructionBanner = ({
  pathDataListByInterval,
  currentIntervalIndex,
  instructionText,
  currentTtsUrl,
  sign,
}: InstructionBannerProps) => {
  const myPosition = useMyPositionStore(state => state.myPosition);
  const instructionLines = React.useMemo(() => {
    const words = (instructionText ?? '').trim().split(/\s+/).filter(Boolean);
    const result: string[] = [];
    for (let i = 0; i < words.length; i += 3) {
      result.push(words.slice(i, i + 3).join(' '));
    }
    return result;
  }, [instructionText, sign]);
  const systemVolume = useVolumeStore(state => state.systemVolume);
  const prevIntervalIndexRef = useRef<number>(-1);
  const prevRemainingDistanceRef = useRef<number | null>(null);
  const passCountRef = useRef<number>(0);
  const [currentRemainingDistanceMeter, setCurrentRemainingDistanceMeter] =
    useState<number | null>(null);

  const { FALLBACK_TTS_URL, START_TTS_URL, END_TTS_URL } = TTS_URL_PRESET;
  const hasPlayedStartTtsRef = useRef(false);

  // TTS 재생 처리
  useEffect(() => {
    const playInstruction = () => {
      prevIntervalIndexRef.current = currentIntervalIndex;

      const playKey = `tts-${currentIntervalIndex}`;
      if (globalTtsState.lastPlayedKey === playKey) return;
      globalTtsState.lastPlayedKey = playKey;

      const ttsUrlToPlay = currentTtsUrl ?? FALLBACK_TTS_URL;
      playTts(playKey, ttsUrlToPlay, systemVolume);
    };

    // START TTS
    if (!hasPlayedStartTtsRef.current) {
      hasPlayedStartTtsRef.current = true;

      const startKey = 'tts-start';
      if (globalTtsState.lastPlayedKey === startKey) return;
      globalTtsState.lastPlayedKey = startKey;
      playTts(startKey, START_TTS_URL, systemVolume);
      setTimeout(() => {
        playInstruction();
      }, 5000);

      return;
    }

    // interval 변경 시
    if (currentIntervalIndex === prevIntervalIndexRef.current) return;
    playInstruction();
  }, [currentIntervalIndex, currentTtsUrl, systemVolume]);

  // 인터벌 내 남은 거리 계산
  useEffect(() => {
    if (!myPosition || pathDataListByInterval.length === 0) return;
    const remainingDistanceMeter = calculateIntervalDistanceByMyPosition(
      myPosition,
      pathDataListByInterval,
      currentIntervalIndex,
      'remaining',
    );

    if (
      Math.abs(
        (prevRemainingDistanceRef.current ?? 0) - remainingDistanceMeter,
      ) <= INTERVAL_DISTANCE_OPTIONS.MIN_INTERVAL_DISTANCE_METER
    ) {
      // 10미터 이내 변화는 무시
      return;
    }

    // 10m 이상의 변화도 3번 이내면 무시 (노이즈 필터링)
    passCountRef.current += 1;
    if (passCountRef.current < MOTION_COMMON_OPTIONS.PASS_CONFIRM_COUNT) return;
    passCountRef.current = 0;
    setCurrentRemainingDistanceMeter(remainingDistanceMeter);
    prevRemainingDistanceRef.current = remainingDistanceMeter;
  }, [myPosition, currentIntervalIndex]);

  const handleInstructionBannerPress = useCallback(() => {
    const key = `tts-${currentIntervalIndex}`;
    const url = currentTtsUrl ?? FALLBACK_TTS_URL;
    playTts(key, url, systemVolume);
  }, [currentIntervalIndex, currentTtsUrl, systemVolume]);

  return (
    <TouchableOpacity
      onPress={handleInstructionBannerPress}
      style={[
        tw(
          'w-full flex flex-row items-center px-1 py-2 bg-brand-primary justify-start',
        ),
        { borderRadius: 20, maxWidth: 348, height: 80, gap: 1 },
      ]}
    >
      <View
        style={[(tw('flex flex-col justify-center items-center'), { gap: 2 })]}
      >
        <Image
          source={DIRECTION_ICONS[String(sign) as keyof typeof DIRECTION_ICONS]}
          style={{ width: 50, height: 50 } as ImageStyle}
          resizeMode="cover"
          testID="direction-icon"
        />
        <Text
          style={[
            tw('font-primary-600 text-on-surface-secondary text-center'),
            { fontSize: 13 },
          ]}
        >
          {currentRemainingDistanceMeter !== null
            ? formatDistanceAdaptive(currentRemainingDistanceMeter)
            : '계산중'}
        </Text>
      </View>
      <View style={[tw('flex flex-col justify-center'), { gap: 2 }]}>
        {instructionLines.map((line, idx) => (
          <Text
            key={`${idx}-${line}`}
            style={[
              tw('font-primary-700 text-on-surface-secondary'),
              { fontSize: 20 },
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
