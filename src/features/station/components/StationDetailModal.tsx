import { getDistanceBetweenCoords } from '@/features/location/utils/location';
import { Coordinates } from '@/features/map/model/map.types';
import { RouteType } from '@/features/routing/model/routing.types';
import { MapAreaStationsData } from '@/features/station/model/station.types';
import { removeOverlappingPart } from '@/features/station/utils/string';
import { tw } from '@/shared/libs/tw-helper';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

interface StationDetailModalProps {
  onSetAsStart?: () => void;
  onSetAsEnd?: () => void;
  onSetAsWaypoint?: () => void;
  onToggleRouteType?: () => void;
  myPosition: Coordinates | undefined;
  stationMetaData: MapAreaStationsData | null;
  routeType?: RouteType;
}
const StationDetailModal = ({
  onSetAsStart = () => {},
  onSetAsEnd = () => {},
  onSetAsWaypoint = () => {},
  onToggleRouteType = () => {},
  myPosition,
  stationMetaData,
  routeType,
}: StationDetailModalProps) => {
  // 토글 애니메이션을 위한 Animated Value
  const toggleAnimation = useRef(
    new Animated.Value(routeType === RouteType.LOOP ? 1 : 0),
  ).current;

  // routeType이 변경될 때 애니메이션 실행
  useEffect(() => {
    Animated.timing(toggleAnimation, {
      toValue: routeType === RouteType.LOOP ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [routeType, toggleAnimation]);

  // 토글 버튼 핸들러
  const handleTogglePress = () => {
    onToggleRouteType();
  };

  // 첫 번째 버튼 (원점/출발) 핸들러
  const handleFirstButtonPress = () => {
    if (routeType === RouteType.LOOP) {
      // Loop 모드: 원점 - 출발지=도착지로 동일하게 설정
      onSetAsStart();
    } else {
      // Constant 모드: 출발지 설정
      onSetAsStart();
    }
  };

  // 두 번째 버튼 (반환점/도착) 핸들러
  const handleSecondButtonPress = () => {
    if (routeType === RouteType.LOOP) {
      // Loop 모드: 반환점 - 경유지로 설정
      if (onSetAsWaypoint) {
        onSetAsWaypoint();
      }
    } else {
      // Constant 모드: 도착지 설정
      onSetAsEnd();
    }
  };

  // 내 위치와 대여소 간 거리 계산
  const [distance, setDistance] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!myPosition || !stationMetaData) {
      setDistance(undefined);
      return;
    }
    const distance = getDistanceBetweenCoords(
      { lat: myPosition.lat, lon: myPosition.lon },
      { lat: stationMetaData.latitude, lon: stationMetaData.longitude },
    );
    setDistance(Math.round(distance));
  }, [myPosition, stationMetaData]);

  if (!stationMetaData) {
    return (
      <View style={tw('flex justify-center w-full items-center')}>
        <ActivityIndicator size="large" color="#01DA86" />
      </View>
    );
  }

  // 따릉이 앱 열기

  const openDaerungiAppOrStore = async () => {
    // 시도할 스킴 (없을 수도 있음)
    const scheme = 'seoulbike://'; // 임의로 정해본 예시
    // 스토어 URLs
    const iosStoreUrl =
      'https://apps.apple.com/kr/app/서울자전거-따릉이/id1037272004';
    const androidStoreUrl = 'market://details?id=com.dki.spb_android';

    try {
      const can = await Linking.canOpenURL(scheme);
      if (can) {
        await Linking.openURL(scheme);
      } else {
        const storeUrl = Platform.OS === 'ios' ? iosStoreUrl : androidStoreUrl;
        await Linking.openURL(storeUrl);
      }
    } catch (err) {
      console.warn('따릉이 앱 실행 실패:', err);
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
          tw('w-full flex flex-row items-center justify-start'),
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
          {`${distance ? distance + 'm' : '거리 측정 중...'}`}
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
            onPress={handleFirstButtonPress}
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
            onPress={handleSecondButtonPress}
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
          onPress={handleTogglePress}
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
        onPress={openDaerungiAppOrStore}
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
