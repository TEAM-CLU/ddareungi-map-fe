import SquareButton from '@/shared/components/button/SquareButton';
import { Text, TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { IconMinus, IconPlus } from '@/shared/components/icons';
import React from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/app/types';
import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';

interface RouteRecommendModalProps {
  distance: number;
  setDistance: React.Dispatch<React.SetStateAction<number>>;
  navigation: NavigationProp<RootStackParamList>;
  routeRecommendModalRef: React.RefObject<BottomSheetModal | null>;
  setIsRouteRecommendBtnPressed: React.Dispatch<React.SetStateAction<boolean>>;
}

const RouteRecommendModal = ({
  distance,
  setDistance,
  navigation,
  routeRecommendModalRef,
  setIsRouteRecommendBtnPressed,
}: RouteRecommendModalProps) => {
  const goToRecommendScreen = () => {
    navigation.navigate('RouteRecommend');
    routeRecommendModalRef?.current?.dismiss();
    setIsRouteRecommendBtnPressed && setIsRouteRecommendBtnPressed(false);
  };

  const handleDecreaseDistanceBtnPress = () => {
    distance > 0.25 && setDistance(prev => prev - 0.25);
    if (distance <= 0.25) {
      setDistance(0.25);
    }
  };

  const handleIncreaseDistanceBtnPress = () => {
    distance < 22.5 && setDistance(prev => prev + 0.25);
    if (distance >= 22.5) {
      setDistance(22.5);
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
            {distance}km
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
      <SquareButton
        title="확인"
        onPress={goToRecommendScreen}
        disabled={false}
      />
    </View>
  );
};

export default RouteRecommendModal;
