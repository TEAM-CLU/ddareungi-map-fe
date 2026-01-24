import { RouteType } from '@/features/routing/model/routing.types';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Animated } from 'react-native';
import { useStationStore } from '@/features/station/stores/useStationStore';
import { removeOverlappingPart } from '@/features/station/utils/removeOverlappingPart';
import { tw } from '@/shared/libs/tw-helper';
import { getDistanceGuideText } from '@/shared/utils/formatting';
import { useStationRouteApplyActions } from '@/features/station/hooks/useStationRouteApplyActions';
import { useStableMyPosition } from '@/features/station/hooks/useStableMyPosition';
import { DISTANCE_LAMBDA } from '@/features/station/model/station.constants';
import { getDistanceBetweenCoords } from '@/shared/utils/measure';

interface StationDetailModalProps {
  onClose?: () => void;
}
const StationDetailModal = ({ onClose }: StationDetailModalProps) => {
  const stationMetaData = useStationStore(state => state.stationMetaData);
  const locationMetaData = useMyPositionStore(state => state.locationMetaData);
  const myPosition = useStableMyPosition({ locationMetaData });

  // 내 위치와 대여소 간 거리 계산
  const [distanceMeter, setDistanceMeter] = useState<number | null>(null);
  useEffect(() => {
    if (!myPosition || !stationMetaData) {
      setDistanceMeter(null);
      return;
    }
    const adjustedDistance =
      getDistanceBetweenCoords(
        { lat: myPosition.lat, lng: myPosition.lng },
        { lat: stationMetaData.latitude, lng: stationMetaData.longitude },
      ) * DISTANCE_LAMBDA;
    setDistanceMeter(Math.round(adjustedDistance));
  }, [myPosition, stationMetaData]);

  const {
    toggleAnimation,
    routeType,
    handleToggleRouteTypePress,
    handleApplyConstantRoutePress,
    handleApplyLoopRoutePress,
  } = useStationRouteApplyActions({ onClose });

  if (!stationMetaData) {
    return (
      <View style={tw('flex justify-center w-full flex-1 items-center')}>
        <ActivityIndicator size="large" color="#C4C4C4" />
      </View>
    );
  }

  // 따릉이 앱 열기

  const openDdareungiApp = async () => {
    // 시도할 스킴 (없을 수도 있음)
    const scheme = 'seoulbike://'; // 임의로 정해본 예시
    // 스토어 URLs
    const iosStoreUrl =
      'https://apps.apple.com/kr/app/서울자전거-따릉이/id1037272004';
    const androidStoreUrl = 'market://details?id=com.dki.spb_android';

    try {
      const canOpenApp = await Linking.canOpenURL(scheme);
      if (canOpenApp) {
        await Linking.openURL(scheme);
      } else {
        const storeUrl = Platform.OS === 'ios' ? iosStoreUrl : androidStoreUrl;
        await Linking.openURL(storeUrl);
      }
    } catch (error) {
      const storeUrl = Platform.OS === 'ios' ? iosStoreUrl : androidStoreUrl;
      await Linking.openURL(storeUrl);
    }
  };

  return (
    <View
      style={[
        tw('w-full flex flex-1 flex-col justify-start items-start'),
        { gap: 20 },
      ]}
    >
      <View
        style={[
          tw('w-full flex flex-row items-center justify-between'),
          { gap: 10 },
        ]}
      >
        <Text
          style={[
            tw('font-primary-700 text-on-surface-primary'),
            { fontSize: 20 },
          ]}
        >
          {stationMetaData.name}
        </Text>
        <Text
          style={[
            tw('font-primary-600 text-on-surface-primary'),
            { fontSize: 15 },
          ]}
        >
          {getDistanceGuideText(distanceMeter)}
        </Text>
      </View>
      <Text
        style={[
          tw('font-primary-600 text-on-surface-quaternary'),
          { fontSize: 15 },
        ]}
      >
        {removeOverlappingPart(stationMetaData.address, stationMetaData.name)}
      </Text>
      <View
        style={[
          tw('w-full flex flex-row items-center justify-between'),
          { gap: 1 },
        ]}
      >
        {/* 출발/도착 버튼과 토글 */}
        <View style={[tw('flex-row'), { gap: 12 }]}>
          <TouchableOpacity
            style={[
              tw('px-4 py-2 bg-brand-primary'),
              { minWidth: 65, minHeight: 30, borderRadius: 20 },
            ]}
            onPress={handleApplyConstantRoutePress}
          >
            <Text
              style={tw(
                'text-center text-base font-primary-600 text-on-surface-secondary',
              )}
            >
              {routeType === RouteType.LOOP ? '원점' : '출발'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              tw('px-4 py-2 bg-icon-container-primary'),
              { minWidth: 65, minHeight: 30, borderRadius: 20 },
            ]}
            onPress={handleApplyLoopRoutePress}
          >
            <Text
              style={tw(
                'text-center text-base font-primary-600 text-on-surface-secondary',
              )}
            >
              {routeType === RouteType.LOOP ? '반환점' : '도착'}
            </Text>
          </TouchableOpacity>
        </View>
        {/* 루프/일반 토글 스위치 */}
        <TouchableOpacity
          style={[
            tw('flex-row items-center rounded-2xl'),
            {
              width: 62,
              height: 36,
              backgroundColor:
                routeType === RouteType.LOOP ? '#01DA86' : '#77838F',
              paddingHorizontal: 4,
            },
          ]}
          onPress={handleToggleRouteTypePress}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              tw('rounded-full bg-surface-primary shadow-sm'),
              {
                width: 22,
                height: 22,
                transform: [
                  {
                    translateX: toggleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 32],
                    }),
                  },
                ],
              },
            ]}
          />
        </TouchableOpacity>
      </View>
      <View
        style={[
          tw('w-full flex flex-row items-center justify-between px-3'),
          { borderRadius: 10, backgroundColor: '#B2F9DE', height: 60 },
        ]}
      >
        <Text
          style={[
            tw('font-primary-600 text-on-surface-primary'),
            { fontSize: 15 },
          ]}
        >
          대여 가능 따릉이
        </Text>
        {/* 완전한 구 */}
        <View
          style={[
            tw(
              'w-8 h-8 justify-center items-center bg-brand-primary rounded-full',
            ),
          ]}
        >
          <Text
            style={[
              tw('font-primary-700 text-on-surface-secondary'),
              { fontSize: 15 },
            ]}
          >
            {stationMetaData.current_bikes}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={openDdareungiApp}
        style={[
          tw('w-full flex flex-row items-center justify-center'),
          { borderRadius: 10, backgroundColor: '#77838F', height: 60 },
        ]}
      >
        <Text
          style={[
            tw('font-primary-600 text-on-surface-secondary'),
            { fontSize: 15 },
          ]}
        >
          대여하기
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default StationDetailModal;
