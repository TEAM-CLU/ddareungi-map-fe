import IntervalProgressBar from '@/features/navigation/components/IntervalProgressBar';
import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore';
import { useVolumeStore } from '@/features/navigation/stores/useVolumeStore';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';
import TreeBadge from '@/shared/components/badge/TreeBadge';
import RoundButton from '@/shared/components/button/RoundButton';
import {
  IconChevronDown,
  IconMute,
  IconVolume,
} from '@/shared/components/icons';
import { tw } from '@/shared/libs/tw-helper';
import { useModalStore } from '@/shared/stores/useModalStore';
import { convertToTrees } from '@/shared/utils/measure';
import Slider from '@react-native-community/slider';
import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { VolumeManager } from 'react-native-volume-manager';
import { useShallow } from 'zustand/react/shallow';

interface NavigationDetailModalProps {
  currentIntervalIndex?: number;
  totalIntervals?: number;
}
const NavigationDetailModal = ({
  currentIntervalIndex,
  totalIntervals,
}: NavigationDetailModalProps) => {
  const { totalCaloriesBurned, totalCarbonSaved } = useNavigationStore(
    useShallow(state => ({
      totalCaloriesBurned: state.totalCaloriesBurned,
      totalCarbonSaved: state.totalCarbonSaved,
    })),
  );

  const { systemVolume, setSystemVolume } = useVolumeStore(
    useShallow(state => ({
      systemVolume: state.systemVolume,
      setSystemVolume: state.setSystemVolume,
    })),
  );

  const { setShowNavigationDetailModal, setShowNavigationEndModal } =
    useModalStore(
      useShallow(state => ({
        setShowNavigationDetailModal: state.setShowNavigationDetailModal,
        setShowNavigationEndModal: state.setShowNavigationEndModal,
      })),
    );
  const isSlidingRef = useRef(false);
  const [sliderValue, setSliderValue] = useState(systemVolume);

  useEffect(() => {
    if (isSlidingRef.current) return;
    setSliderValue(systemVolume);
  }, [systemVolume]);

  // 시스템 음성 볼륨 변경 핸들러
  const handleSystemVolumeSlidingComplete = async (volume: number) => {
    setSystemVolume(volume);
    try {
      if (VolumeManager && typeof VolumeManager.setVolume === 'function') {
        await VolumeManager.setVolume(volume);
      }
    } catch (error) {
      console.error('시스템 볼륨을 설정하는 중 오류 발생:', error);
    } finally {
      isSlidingRef.current = false;
    }
  };

  const handleEndNavigationPress = () => {
    setShowNavigationDetailModal(false);
    setShowNavigationEndModal(true);
  };

  return (
    <View
      style={[
        tw('w-full flex flex-col justify-start flex-1 bg-surface-primary'),
        { gap: 16 },
      ]}
    >
      <View style={tw('w-full flex flex-row justify-between items-center')}>
        <Text
          style={[
            tw('font-primary-700 text-on-surface-primary text-left'),
            { fontSize: 20 },
          ]}
        >
          네비게이션 상세
        </Text>
        <TouchableOpacity onPress={() => setShowNavigationDetailModal(false)}>
          <IconChevronDown color={'#77838F'} />
        </TouchableOpacity>
      </View>
      <View style={[tw('w-full'), { height: 1, backgroundColor: '#D8D8D8' }]} />
      <View
        style={[tw('w-full flex flex-col grow justify-start'), { gap: 35 }]}
      >
        <View style={[tw('flex flex-col w-full mt-3'), { gap: 15 }]}>
          <Text
            style={[
              tw('font-primary-600 text-on-surface-primary text-left'),
              { fontSize: 15 },
            ]}
          >
            현재 칼로리 소모량 / 탄소 저감량
          </Text>
          <View style={[tw('w-full flex flex-row  items-center'), { gap: 16 }]}>
            <CalorieBadge value={totalCaloriesBurned} />
            <TreeBadge value={convertToTrees(totalCarbonSaved)} />
          </View>
        </View>
        {/*  */}
        {totalIntervals !== undefined &&
        currentIntervalIndex !== undefined &&
        totalIntervals > 0 ? (
          <IntervalProgressBar
            totalIntervals={totalIntervals}
            currentIntervalIndex={currentIntervalIndex}
          />
        ) : (
          <Text
            style={[
              tw('font-primary-600 text-on-surface-primary text-left'),
              { fontSize: 15 },
            ]}
          >
            진행 구간 정보가 없습니다.
          </Text>
        )}
        {/*  */}
        <View style={[tw('flex flex-col w-full'), { gap: 15 }]}>
          <Text
            style={[
              tw('font-primary-600 text-on-surface-primary text-left'),
              { fontSize: 15 },
            ]}
          >
            시스템 음성크기
          </Text>
          <View style={[tw('w-full flex flex-row  items-center'), { gap: 16 }]}>
            <IconMute />
            <Slider
              style={tw('flex-1')}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={sliderValue}
              onValueChange={setSliderValue}
              onSlidingStart={() => {
                isSlidingRef.current = true;
              }}
              onSlidingComplete={handleSystemVolumeSlidingComplete}
              thumbImage={require('@/assets/imgs/volumeSliderThumb.png')}
              minimumTrackTintColor="#01DA86"
            />
            <IconVolume />
          </View>
        </View>
        <RoundButton
          title={'안내 종료하기'}
          onPress={handleEndNavigationPress}
          preset={'lg'}
        />
      </View>
    </View>
  );
};

export default NavigationDetailModal;
