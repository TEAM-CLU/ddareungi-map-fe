import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '@/shared/libs/tw-helper';
import { IconPause, IconPlay } from '@/shared/components/icons';
import {
  formatTimeHHMMSSNumber,
  formatDistanceAdaptiveText,
  formatCaloriesKcalText,
} from '@/shared/utils/formatting';
import { useMeasurementStore } from '../stores/useMeasurementStore';
import { formatPace } from '../utils/formatPace';

interface MeasureActiveScreenProps {
  onTogglePause: () => void;
  onFinishMeasurement: () => void;
}

interface MetricHeaderItemProps {
  label: string;
  value: string;
}

interface CompactMetricProps {
  label: string;
  value: string;
}

function MetricHeaderItem({ label, value }: MetricHeaderItemProps) {
  return (
    <View style={tw('flex-1 items-center px-1')}>
      <Text
        style={[
          tw('font-primary-500 text-on-surface-placeholder text-xs'),
          { lineHeight: 16 },
        ]}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        minimumFontScale={0.75}
        style={[
          tw('font-primary-700 text-on-surface-primary mt-1'),
          {
            width: '100%',
            fontSize: 17,
            textAlign: 'center',
            fontVariant: ['tabular-nums'],
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function CompactMetric({ label, value }: CompactMetricProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      <Text
        style={[
          tw('font-primary-500 text-on-surface-placeholder'),
          { fontSize: 12 },
        ]}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        minimumFontScale={0.75}
        style={[
          tw('font-primary-700 text-on-surface-primary'),
          {
            flex: 1,
            textAlign: 'right',
            fontSize: 16,
            fontVariant: ['tabular-nums'],
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default function MeasureActiveScreen({
  onTogglePause,
  onFinishMeasurement,
}: MeasureActiveScreenProps) {
  const {
    metrics,
    elapsedTimeSeconds,
    targetDistanceKm,
    isPaused,
  } = useMeasurementStore();

  const targetMeter = targetDistanceKm * 1000;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 16,
          }}
        >
          {/* 상단: 시간, 페이스, 속도 */}
          <View style={tw('flex-row pt-3 pb-3 border-b border-line-default')}>
            <MetricHeaderItem
              label="시간"
              value={formatTimeHHMMSSNumber(elapsedTimeSeconds)}
            />
            <MetricHeaderItem
              label="페이스"
              value={`${formatPace(metrics.paceMinutesPerKm)}/km`}
            />
            <MetricHeaderItem
              label="속도"
              value={`${metrics.speedKmh.toFixed(1)} km/h`}
            />
          </View>

          {/* 중단: 이동거리 + 칼로리/목표 */}
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
              gap: 12,
            }}
          >
            <View style={{ flex: 1.15, minWidth: 0 }}>
              <Text
                style={[
                  tw('font-primary-500 text-on-surface-placeholder'),
                  { fontSize: 12, marginBottom: 5 },
                ]}
              >
                이동 거리
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.72}
                style={[
                  tw('font-primary-700 text-on-surface-primary'),
                  {
                    width: '100%',
                    fontSize: 31,
                    lineHeight: 38,
                    fontVariant: ['tabular-nums'],
                  },
                ]}
              >
                {formatDistanceAdaptiveText(metrics.traveledDistanceMeter)}
              </Text>
            </View>
            <View
              style={[
                tw('rounded-xl border border-line-default'),
                {
                  flex: 1,
                  gap: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  backgroundColor: '#F8FAFB',
                  minWidth: 0,
                },
              ]}
            >
              <CompactMetric
                label="칼로리"
                value={formatCaloriesKcalText(metrics.caloriesBurned)}
              />
              <CompactMetric
                label="목표"
                value={formatDistanceAdaptiveText(targetMeter)}
              />
            </View>
          </View>

          {/* 하단: 일시정지/재생 + 완전 종료 */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              paddingTop: 10,
              paddingBottom: 12,
              borderTopWidth: 1,
              borderTopColor: '#E5E7EB',
            }}
          >
            <TouchableOpacity
              onPress={onTogglePause}
              style={[
                tw('rounded-full bg-brand-primary items-center justify-center'),
                { width: 48, height: 48 },
              ]}
              activeOpacity={0.8}
            >
              {isPaused ? (
                <IconPlay color="#ffffff" />
              ) : (
                <IconPause color="#ffffff" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onFinishMeasurement}
              style={[
                tw('rounded-full items-center justify-center'),
                {
                  height: 38,
                  paddingHorizontal: 26,
                  backgroundColor: '#FF4D4D',
                },
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  tw('font-primary-700'),
                  { fontSize: 14, color: '#fff' },
                ]}
              >
                종료
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
