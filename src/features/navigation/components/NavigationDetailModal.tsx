import { useVolumeStore } from '@/features/navigation/stores/useVolumeStore';
import RoundButton from '@/shared/components/button/RoundButton';
import {
  IconChevronDown,
  IconMute,
  IconVolume,
} from '@/shared/components/icons';
import { tw } from '@/shared/libs/tw-helper';
import { useModalStore } from '@/shared/stores/useModalStore';
import Slider from '@react-native-community/slider';
import { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { VolumeManager } from 'react-native-volume-manager';
import { useShallow } from 'zustand/react/shallow';

const NavigationDetailModal = () => {
  const { systemVolume, setSystemVolume } = useVolumeStore(
    useShallow(state => ({
      systemVolume: state.systemVolume,
      setSystemVolume: state.setSystemVolume,
    })),
  );
  const setShowNavigationDetailModal = useModalStore(
    state => state.setShowNavigationDetailModal,
  );
  // 시스템 볼륨 초기값 설정 및 리스너 등록
  useEffect(() => {
    try {
      VolumeManager.getVolume().then(volumeData =>
        setSystemVolume(volumeData.volume),
      );
    } catch (error) {
      console.error('시스템 볼륨을 가져오는 중 오류 발생:', error);
    }

    const volumeListener = VolumeManager.addVolumeListener(
      (volumeData: { volume: number }) => {
        setSystemVolume(volumeData.volume);
      },
    );

    return () => {
      volumeListener.remove();
    };
  }, []);

  // 시스템 음성 볼륨 변경 핸들러
  const handleSystemVolumeSliderChange = async (volume: number) => {
    setSystemVolume(volume);
    try {
      await VolumeManager.setVolume(volume);
    } catch (error) {
      console.error('시스템 볼륨을 설정하는 중 오류 발생:', error);
    }
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
          네비게이션 설정
        </Text>
        <TouchableOpacity onPress={() => setShowNavigationDetailModal(false)}>
          <IconChevronDown color={'#77838F'} />
        </TouchableOpacity>
      </View>
      <View style={[tw('w-full'), { height: 1, backgroundColor: '#D8D8D8' }]} />
      <View
        style={[tw('w-full flex flex-col grow justify-start'), { gap: 35 }]}
      >
        <View style={[tw('flex flex-col w-full'), { gap: 30 }]}>
          <Text
            style={[
              tw('font-primary-600 text-on-surface-primary text-left'),
              { fontSize: 13 },
            ]}
          >
            알림음 음성크기
          </Text>
          <View style={[tw('w-full flex flex-row  items-center'), { gap: 16 }]}>
            <IconMute />
            <Slider
              style={tw('flex-1')}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={systemVolume}
              onValueChange={handleSystemVolumeSliderChange}
              thumbImage={require('@/assets/imgs/volumeSliderThumb.png')}
              minimumTrackTintColor="#01DA86"
            />
            <IconVolume />
          </View>
        </View>
        <RoundButton
          title={'안내 종료하기'}
          onPress={function (): void {
            throw new Error('Function not implemented.');
          }}
          preset={'lg'}
        />
      </View>
    </View>
  );
};

export default NavigationDetailModal;
