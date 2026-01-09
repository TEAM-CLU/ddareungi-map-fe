import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Image, ImageStyle, Text, TouchableOpacity, View } from 'react-native';

import {
  DIRECTION_ICONS,
  INTERVAL_DISTANCE_OPTIONS,
  MOTION_COMMON_OPTIONS,
  PREVIEW_CONIFG,
  TTS_URL_PRESET,
} from '@/features/navigation/model/navigation.constants';
import { tw } from '@/shared/libs/tw-helper';
import { IntervalPathData } from '@/features/navigation/model/navigation.types';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { calculateIntervalDistanceByMyPosition } from '@/features/navigation/utils/navigationController';
import { formatDistanceAdaptive } from '@/shared/utils/formatting';
import { useVolumeStore } from '@/features/navigation/stores/useVolumeStore';
import { playTts } from '@/features/navigation/libs/playTts';

interface InstructionBannerProps {
  pathDataListByInterval: IntervalPathData[];

  currentIntervalIndex: number;
  currentInstructionText: string;
  currentTtsUrl: string | null;
  currentSign: number;

  // “다음 지시(프리뷰)”는 orchestrator에서 내려줌
  previewInstructionText: string;
  previewTtsUrl: string | null;
  previewSign: number | null;

  isLoading: boolean;
}

//  여기만 튜닝하면 됨

const InstructionBanner = ({
  pathDataListByInterval,
  currentIntervalIndex,
  currentInstructionText,
  currentTtsUrl,
  currentSign,
  previewInstructionText,
  previewTtsUrl,
  previewSign,
  isLoading,
}: InstructionBannerProps) => {
  if (isLoading) {
    return null;
  }

  const myPosition = useMyPositionStore(state => state.myPosition);
  const systemVolume = useVolumeStore(state => state.systemVolume);

  const { PREVIEW_THRESHOLD_METER, PREVIEW_ENTER_COUNT_MIN } = PREVIEW_CONIFG;
  const { FALLBACK_TTS_URL, START_TTS_URL } = TTS_URL_PRESET;
  const hasPlayedStartTtsRef = useRef(false);

  // ----------------------------
  // 1) 현재 인터벌 남은거리 계산
  // ----------------------------
  const prevIntervalIndexRef = useRef<number>(-1);
  const prevRemainingDistanceRef = useRef<number | null>(null);
  const passCountRef = useRef<number>(0);
  const [previewEnterCount, previewEnterCountSet] = useState<number>(0);

  const [currentRemainingDistanceMeter, setCurrentRemainingDistanceMeter] =
    useState<number | null>(null);

  // 인터벌 바뀌면 남은거리 계산값 리셋
  useEffect(() => {
    if (
      pathDataListByInterval.length === 0 ||
      currentIntervalIndex === prevIntervalIndexRef.current
    )
      return;

    prevIntervalIndexRef.current = currentIntervalIndex;
    prevRemainingDistanceRef.current = null;
    passCountRef.current = 0;
    setCurrentRemainingDistanceMeter(null);
    previewEnterCountSet(0);
  }, [currentIntervalIndex, pathDataListByInterval.length]);

  useEffect(() => {
    if (!myPosition || pathDataListByInterval.length === 0) return;

    const remainingDistanceMeter = calculateIntervalDistanceByMyPosition(
      myPosition,
      pathDataListByInterval,
      currentIntervalIndex,
      'remaining',
    );

    // 10m 이하 변화 무시
    if (
      Math.abs(
        (prevRemainingDistanceRef.current ?? 0) - remainingDistanceMeter,
      ) <= INTERVAL_DISTANCE_OPTIONS.MIN_INTERVAL_DISTANCE_METER
    ) {
      return;
    }

    // 10m 이상 변화도 3번 누적 후 반영
    passCountRef.current += 1;
    if (passCountRef.current < MOTION_COMMON_OPTIONS.PASS_CONFIRM_COUNT) return;

    passCountRef.current = 0;
    prevRemainingDistanceRef.current = remainingDistanceMeter;
    setCurrentRemainingDistanceMeter(remainingDistanceMeter);
    if (remainingDistanceMeter <= PREVIEW_THRESHOLD_METER) {
      previewEnterCountSet(prev => Math.min(prev + 1, PREVIEW_ENTER_COUNT_MIN));
    }
  }, [myPosition, currentIntervalIndex, pathDataListByInterval]);

  // ----------------------------
  // 2) 프리뷰 모드 판단: “현재 인터벌 남은거리 <= 50m” + count 조건
  // ----------------------------
  const hasPreviewPayload =
    Boolean(previewInstructionText?.trim()) && previewSign !== null;

  const isPreviewMode =
    hasPreviewPayload &&
    currentRemainingDistanceMeter !== null &&
    currentRemainingDistanceMeter <= PREVIEW_THRESHOLD_METER &&
    previewEnterCount >= PREVIEW_ENTER_COUNT_MIN;

  // ----------------------------
  // 3) 표시/클릭/TTS 모두 display로 통일
  // ----------------------------
  const displayText = isPreviewMode
    ? previewInstructionText
    : currentInstructionText;
  const displaySign = isPreviewMode ? (previewSign as number) : currentSign;
  const displayTtsUrl =
    (isPreviewMode ? previewTtsUrl : currentTtsUrl) ?? FALLBACK_TTS_URL;

  const instructionLines = useMemo(() => {
    const words = (displayText ?? '').trim().split(/\s+/).filter(Boolean);

    const result: string[] = [];
    for (let i = 0; i < words.length; i += 3) {
      result.push(words.slice(i, i + 3).join(' '));
    }
    return result;
  }, [displayText]);

  // ----------------------------
  // 4) TTS 정책
  // - START 1회
  // - current interval 바뀌면 current TTS 1회
  // - previewMode 진입 순간 preview TTS 1회
  // ----------------------------
  const prevCurrentIntervalRef = useRef<number>(-1);
  const prevPreviewModeRef = useRef<boolean>(false);

  useEffect(() => {
    // START 1회
    if (!hasPlayedStartTtsRef.current) {
      hasPlayedStartTtsRef.current = true;

      const startKey = 'tts-navigation-start';
      playTts(startKey, START_TTS_URL, systemVolume);

      return;
    }

    // 1) preview 모드 "진입" 순간에만 preview TTS
    if (isPreviewMode && !prevPreviewModeRef.current) {
      prevPreviewModeRef.current = true;
      const previewttsKey = `tts-preview-${currentIntervalIndex}`;
      playTts(previewttsKey, previewTtsUrl ?? FALLBACK_TTS_URL, systemVolume);

      return;
    }

    // preview 모드가 풀리면 상태도 풀어줌
    if (!isPreviewMode && prevPreviewModeRef.current) {
      prevPreviewModeRef.current = false;
    }

    // 2) current interval 변경 시 current TTS
    if (currentIntervalIndex === prevCurrentIntervalRef.current) return;
    prevCurrentIntervalRef.current = currentIntervalIndex;

    const currentTtsKey = `tts-current-${currentIntervalIndex}`;
    playTts(currentTtsKey, currentTtsUrl ?? FALLBACK_TTS_URL, systemVolume);
  }, [
    currentIntervalIndex,
    currentTtsUrl,
    isPreviewMode,
    previewTtsUrl,
    systemVolume,
    START_TTS_URL,
    FALLBACK_TTS_URL,
  ]);

  // 클릭 시도 “지금 화면에 보이는(display)” 걸 재생
  const handleInstructionBannerPress = useCallback(() => {
    const key = isPreviewMode
      ? `tts-preview-${currentIntervalIndex}`
      : `tts-turn-${currentIntervalIndex}`;

    playTts(key, displayTtsUrl, systemVolume);
  }, [isPreviewMode, currentIntervalIndex, displayTtsUrl, systemVolume]);

  return (
    <TouchableOpacity
      onPress={handleInstructionBannerPress}
      style={[
        tw(
          'w-full flex flex-row items-center px-1 py-2 bg-brand-primary justify-start relative',
        ),
        { borderRadius: 20, maxWidth: 348, height: 80, gap: 1 },
      ]}
    >
      <View
        style={[
          tw('absolute -bottom-4 flex flex-row items-center justify-between'),
          { left: '-50%', translateX: 50 },
        ]}
      >
        <View
          style={tw(
            'flex justify-center h-5 w-5 items-center px-2 bg-surface-primary rounded-full',
          )}
        >
          <Text
            style={[
              tw('font-primary-600 text-on-surface-primary'),
              { fontSize: 13 },
            ]}
          >
            {currentIntervalIndex + 1}
          </Text>
        </View>
        <Text
          style={[
            tw(
              'font-primary-600 text-on-surface-secondary text-center rounded-xl bg-brand-primary px-2 py-1',
            ),
            { fontSize: 13 },
          ]}
        >
          {currentRemainingDistanceMeter !== null
            ? formatDistanceAdaptive(currentRemainingDistanceMeter)
            : '계산중'}
        </Text>
      </View>
      <Image
        source={
          DIRECTION_ICONS[String(displaySign) as keyof typeof DIRECTION_ICONS]
        }
        style={{ width: 50, height: 50 } as ImageStyle}
        resizeMode="cover"
      />
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
