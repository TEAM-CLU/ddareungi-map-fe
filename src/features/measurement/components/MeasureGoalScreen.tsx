import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '@/shared/libs/tw-helper';
import { IconMinus, IconPlus } from '@/shared/components/icons';
import { IconBackArrow } from '@/shared/components/icons';
import RoundButton from '@/shared/components/button/RoundButton';
import { useMeasurementStore } from '../stores/useMeasurementStore';
import { MEASUREMENT_GOAL_CONFIG } from '../model/measurement.constants';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';

interface MeasureGoalScreenProps {
  onStartCountdown: () => void;
}

export default function MeasureGoalScreen({
  onStartCountdown,
}: MeasureGoalScreenProps) {
  const { navigation } = useAppNavigation();
  const { targetDistanceKm, setTargetDistanceKm } = useMeasurementStore();

  const handleDecrease = () => {
    if (targetDistanceKm <= MEASUREMENT_GOAL_CONFIG.MIN_TARGET_KM) {
      setTargetDistanceKm(MEASUREMENT_GOAL_CONFIG.MIN_TARGET_KM);
    } else {
      setTargetDistanceKm(
        targetDistanceKm - MEASUREMENT_GOAL_CONFIG.STEP_KM,
      );
    }
  };

  const handleIncrease = () => {
    if (targetDistanceKm >= MEASUREMENT_GOAL_CONFIG.MAX_TARGET_KM) {
      setTargetDistanceKm(MEASUREMENT_GOAL_CONFIG.MAX_TARGET_KM);
    } else {
      setTargetDistanceKm(
        targetDistanceKm + MEASUREMENT_GOAL_CONFIG.STEP_KM,
      );
    }
  };

  return (
    <SafeAreaView style={tw('flex-1')} edges={['top']}>
      <View
        style={[
          tw('flex-row items-center px-4 py-3 border-b border-line-default'),
          { backgroundColor: 'rgba(255, 255, 255, 0.85)' },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <IconBackArrow width={24} height={24} color="gray" />
        </TouchableOpacity>
        <Text
          style={[
            tw('flex-1 text-center font-primary-700 text-on-surface-primary'),
            { fontSize: 18 },
          ]}
        >
          측정 목표 설정
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View
        style={[
          tw('flex-1 justify-center px-6'),
          { gap: 50, backgroundColor: 'rgba(255, 255, 255, 0.58)' },
        ]}
      >
        <Text
          style={[
            tw('text-center font-primary-700 text-on-surface-primary'),
            { fontSize: 20 },
          ]}
        >
          목표 거리를 선택해 주세요.
        </Text>

        <View style={[tw('flex-row items-center justify-center'), { gap: 17 }]}>
          <TouchableOpacity
            onPress={handleDecrease}
            style={[
              tw('rounded-full justify-center items-center'),
              { width: 60, height: 60, backgroundColor: '#A7A7A74D' },
            ]}
          >
            <IconMinus width={24} height={24} color="#77838F" />
          </TouchableOpacity>
          <Text
            style={[
              tw('font-primary-700 text-on-surface-primary'),
              { fontSize: 24 },
            ]}
          >
            {targetDistanceKm}km
          </Text>
          <TouchableOpacity
            onPress={handleIncrease}
            style={[
              tw('rounded-full justify-center items-center'),
              { width: 60, height: 60, backgroundColor: '#A7A7A74D' },
            ]}
          >
            <IconPlus width={24} height={24} color="#77838F" />
          </TouchableOpacity>
        </View>

        <Text
          style={[
            tw('text-center font-primary-500 text-on-surface-placeholder'),
            { fontSize: 12 },
          ]}
        >
          최소 {MEASUREMENT_GOAL_CONFIG.MIN_TARGET_KM}km ~ 최대{' '}
          {MEASUREMENT_GOAL_CONFIG.MAX_TARGET_KM}km (0.25km 단위)
        </Text>

        <View style={tw('items-center')}>
          <RoundButton
            title="시작"
            onPress={onStartCountdown}
            preset="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
