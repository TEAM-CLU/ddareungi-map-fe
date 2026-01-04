import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import IconFinishLine from '@/shared/components/icons/IconFinishLine';
import { createStableColorByIndex } from '@/features/navigation/utils/createStableColorByIndex';

interface IntervalProgressBarProps {
  totalIntervals: number;
  currentIntervalIndex: number;
}

const IntervalProgressBar = ({
  totalIntervals,
  currentIntervalIndex,
}: IntervalProgressBarProps) => {
  const segmentColors = useMemo(
    () =>
      Array.from({ length: totalIntervals }, (_, index) =>
        createStableColorByIndex(index),
      ),
    [totalIntervals],
  );

  const safeCurrentIndex = Math.max(
    0,
    Math.min(currentIntervalIndex, totalIntervals - 1),
  );

  return (
    <View style={[tw('flex flex-col w-full'), { gap: 30 }]}>
      <Text
        style={[
          tw('font-primary-600 text-on-surface-primary text-left'),
          { fontSize: 13 },
        ]}
      >
        경로 구간 진행률
      </Text>

      <View style={[tw('flex flex-col w-full'), { gap: 8 }]}>
        <View style={[tw('flex flex-row items-center'), { gap: 16 }]}>
          <Text
            style={[
              tw('text-brand-primary font-primary-600'),
              { fontSize: 13 },
            ]}
          >
            START
          </Text>

          {/* Progress Bar */}
          <View
            style={[
              tw('flex flex-row flex-1 h-2 overflow-hidden'),
              { borderRadius: 999, backgroundColor: '#E5E7EB' },
            ]}
          >
            {Array.from({ length: totalIntervals }).map((_, index) => {
              const isFilled = index <= safeCurrentIndex;

              return (
                <View
                  key={index}
                  style={{
                    flex: 1,
                    backgroundColor: '#E5E7EB',
                  }}
                >
                  <View
                    style={{
                      width: isFilled ? '100%' : '0%',
                      height: '100%',
                      backgroundColor: segmentColors[index],
                    }}
                  />
                </View>
              );
            })}
          </View>

          <IconFinishLine width={22} height={22} />
        </View>
        {/* 인덱스 표시 */}
        <Text
          style={[
            tw('text-on-surface-primary font-primary-600 text-center'),
            { fontSize: 12 },
          ]}
        >
          {safeCurrentIndex + 1}/{totalIntervals}
        </Text>
      </View>
    </View>
  );
};

export default IntervalProgressBar;
