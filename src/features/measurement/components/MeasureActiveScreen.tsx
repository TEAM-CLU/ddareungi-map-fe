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
            fontSize: 20,
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
    <SafeAreaView style={tw('flex-1')} edges={['bottom']}>
      <View
        style={[
          tw('flex-1 px-4'),
          { backgroundColor: 'rgba(255, 255, 255, 0.58)' },
        ]}
      >
        {/* 상단: 시간, 페이스, 속도 */}
        <View style={tw('flex-row py-6 border-b border-line-default')}>
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

        {/* 중단: 이동거리(주요) + 칼로리/목표(동일 위계) */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 24,
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text
              style={[
                tw('font-primary-500 text-on-surface-placeholder'),
                { fontSize: 12, marginBottom: 6 },
              ]}
            >
              이동 거리
            </Text>
            <Text
              style={[
                tw('font-primary-700 text-on-surface-primary'),
                { fontSize: 36 },
              ]}
            >
              {formatDistanceAdaptiveText(metrics.traveledDistanceMeter)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              width: '100%',
              maxWidth: 280,
              justifyContent: 'space-between',
            }}
          >
            <View
              style={[
                tw('rounded-xl'),
                {
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  minWidth: 0,
                },
              ]}
            >
              <Text
                style={[
                  tw('font-primary-500 text-on-surface-placeholder'),
                  { fontSize: 12, marginBottom: 6 },
                ]}
              >
                소모 칼로리
              </Text>
              <Text
                style={[
                  tw('font-primary-700 text-on-surface-primary'),
                  { fontSize: 18 },
                ]}
              >
                {formatCaloriesKcalText(metrics.caloriesBurned)}
              </Text>
            </View>
            <View
              style={[
                tw('rounded-xl'),
                {
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  minWidth: 0,
                  marginLeft: 12,
                },
              ]}
            >
              <Text
                style={[
                  tw('font-primary-500 text-on-surface-placeholder'),
                  { fontSize: 12, marginBottom: 6 },
                ]}
              >
                목표 거리
              </Text>
              <Text
                style={[
                  tw('font-primary-700 text-on-surface-primary'),
                  { fontSize: 18 },
                ]}
              >
                {formatDistanceAdaptiveText(targetMeter)}
              </Text>
            </View>
          </View>
        </View>

        {/* 하단: 일시정지/재생 + 완전 종료 */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            paddingVertical: 20,
            paddingBottom: 32,
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
          }}
        >
          <TouchableOpacity
            onPress={onTogglePause}
            style={[
              tw('rounded-full bg-brand-primary items-center justify-center'),
              { width: 56, height: 56 },
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
                height: 42,
                paddingHorizontal: 28,
                backgroundColor: '#FF4D4D',
              },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                tw('font-primary-700'),
                { fontSize: 15, color: '#fff' },
              ]}
            >
              종료
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
