import SquareButton from '@/shared/components/button/SquareButton';
import { Text, TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { IconMinus, IconPlus } from '@/shared/components/icons';
import React from 'react';
import { useRouteStore } from '../../stores/useRouteStore';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useMapStore } from '@/features/map/stores/useMapStore';

const RouteRecommendModal = () => {
  const { distance, setDistance } = useRouteStore();

  const { setShowRouteRecommendModal } = useModalStore();
  const { globalNavigation } = useMapStore();

  const handleOkBtnPress = () => {
    // 현재 화면이 RouteRecommend가 아닐 때만 navigate
    const currentRoute =
      globalNavigation.getState().routes[globalNavigation.getState().index];
    if (currentRoute.name !== 'RouteRecommend') {
      globalNavigation.navigate('RouteRecommend');
    }
    setShowRouteRecommendModal(false);
  };

  const handleDecreaseDistanceBtnPress = () => {
    if (distance === null || distance <= 0.25) {
      setDistance(0.25);
    } else if (distance > 0.25) {
      setDistance(distance - 0.25);
    }
  };

  const handleIncreaseDistanceBtnPress = () => {
    if (distance === null) {
      setDistance(0.25);
    } else if (distance >= 22.5) {
      setDistance(22.5);
    } else {
      setDistance(distance + 0.25);
    }
  };

  return (
    <View
      style={[
        tw('w-full flex flex-col justify-center items-center'),
        { gap: 50 },
      ]}
    >
      <Text
        style={[
          tw('font-primary-700 text-on-surface-primary'),
          { fontSize: 20 },
        ]}
      >
        이동 거리를 선택해 주세요.
      </Text>
      <View
        style={[
          tw('flex flex-col w-full justify-center items-center'),
          { gap: 17 },
        ]}
      >
        <View
          style={[
            tw('flex flex-row items-center justify-between w-full'),
            { maxWidth: 276 },
          ]}
        >
          <TouchableOpacity
            onPress={handleDecreaseDistanceBtnPress}
            style={[
              tw('flex justify-center items-center rounded-full'),
              { width: 60, height: 60, backgroundColor: '#A7A7A74D' },
            ]}
          >
            <IconMinus width={24} height={24} color="#77838F" />
          </TouchableOpacity>
          <Text
            style={[
              tw('font-primary-700 text-on-surface-primary'),
              { fontSize: 20 },
            ]}
          >
            {distance !== null ? distance : 5}km
          </Text>
          <TouchableOpacity
            onPress={handleIncreaseDistanceBtnPress}
            style={[
              tw('flex justify-center items-center rounded-full'),
              { width: 60, height: 60, backgroundColor: '#A7A7A74D' },
            ]}
          >
            <IconPlus width={24} height={24} color="#77838F" />
          </TouchableOpacity>
        </View>
        <Text
          style={[
            tw('font-primary-500 text-on-surface-placeholder'),
            { fontSize: 12 },
          ]}
        >
          최소 거리 0.25km ~ 최대 거리 22.5km 입니다.
        </Text>
      </View>
      <SquareButton title="확인" onPress={handleOkBtnPress} disabled={false} />
    </View>
  );
};

export default RouteRecommendModal;
