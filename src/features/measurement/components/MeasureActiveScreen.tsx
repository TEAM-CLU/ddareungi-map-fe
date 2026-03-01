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
import { useMeasurementOrchestrator } from '../hooks/useMeasurementOrchestrator';
import { formatPace } from '../utils/formatPace';

export default function MeasureActiveScreen() {
  const {
    metrics,
    elapsedTimeSeconds,
    targetDistanceKm,
    isPaused,
  } = useMeasurementStore();
  const { handleTogglePause, handleFinishMeasurement } =
    useMeasurementOrchestrator();

  const targetMeter = targetDistanceKm * 1000;

  return (
    <SafeAreaView style={tw('flex-1 bg-surface-primary')} edges={['top']}>
      <View style={tw('flex-1 px-4')}>
        {/* 상단: 시간, 페이스, 속도 */}
        <View
          style={[
            tw('flex-row justify-around py-6'),
            { borderBottomWidth: 1, borderColor: '#E5E7EB' },
          ]}
        >
          <View style={tw('items-center')}>
            <Text
              style={[
                tw('font-primary-500 text-on-surface-placeholder'),
                { fontSize: 12 },
              ]}
            >
              시간
            </Text>
            <Text
              style={[
                tw('font-primary-700 text-on-surface-primary mt-1'),
                { fontSize: 20 },
              ]}
            >
              {formatTimeHHMMSSNumber(elapsedTimeSeconds)}
            </Text>
          </View>
          <View style={tw('items-center')}>
            <Text
              style={[
                tw('font-primary-500 text-on-surface-placeholder'),
                { fontSize: 12 },
              ]}
            >
              페이스
            </Text>
            <Text
              style={[
                tw('font-primary-700 text-on-surface-primary mt-1'),
                { fontSize: 20 },
              ]}
            >
              {formatPace(metrics.paceMinutesPerKm)}/km
            </Text>
          </View>
          <View style={tw('items-center')}>
            <Text
              style={[
                tw('font-primary-500 text-on-surface-placeholder'),
                { fontSize: 12 },
              ]}
            >
              속도
            </Text>
            <Text
              style={[
                tw('font-primary-700 text-on-surface-primary mt-1'),
                { fontSize: 20 },
              ]}
            >
              {metrics.speedKmh.toFixed(1)} km/h
            </Text>
          </View>
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
            onPress={handleTogglePause}
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
            onPress={handleFinishMeasurement}
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
