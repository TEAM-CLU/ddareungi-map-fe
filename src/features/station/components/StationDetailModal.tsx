import { getDistanceBetweenCoords } from '@/features/location/utils/location';
import { useMapStore } from '@/features/map/stores/useMapStore';
import { RouteType } from '@/features/routing/model/routing.types';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { removeOverlappingPart } from '@/features/station/utils/string';
import { tw } from '@/shared/libs/tw-helper';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useStationStore } from '../stores/useStationStore';
import { AutocompleteResult } from '@/features/search/model/search.types';
import { getDistanceText } from '@/shared/utils/formatting';

interface StationDetailModalProps {
  onClose?: () => void;
}
const StationDetailModal = ({ onClose }: StationDetailModalProps) => {
  const {
    routeType,
    setRouteType,
    setStart,
    setEnd,
    addWaypoint,
    syncStartEndInLoopMode,
  } = useRouteStore();
  const { globalNavigation } = useMapStore();
  const { stationMetaData, lamda } = useStationStore();
  const { myPosition } = useMyPositionStore();

  // RouteType 토글 함수
  const toggleRouteType = () => {
    const newRouteType =
      routeType === RouteType.CONSTANT ? RouteType.LOOP : RouteType.CONSTANT;
    setRouteType(newRouteType);
  };

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
  const handleTogglePress = () => toggleRouteType();

  // 첫 번째 버튼 (출발/원점) 핸들러
  const handleFirstButtonPress = () => {
    onClose?.(); // 모달 닫기

    const placeData: AutocompleteResult = {
      placeKey: `start-${Date.now()}`,
      name: stationMetaData!.name,
      address: stationMetaData!.address,
      latitude: stationMetaData!.latitude!,
      longitude: stationMetaData!.longitude!,
    };

    // LOOP 모드면 출발-도착 동기화
    if (routeType === RouteType.LOOP) {
      syncStartEndInLoopMode(placeData, 'start');
    } else {
      setStart(placeData);
    }
    // RouteSelect 화면으로 이동
    globalNavigation.navigate('RouteSelect');
  };

  // 두 번째 버튼 (반환점/도착) 핸들러
  const handleSecondButtonPress = () => {
    onClose?.(); // 모달 닫기

    const placeData: AutocompleteResult = {
      placeKey: routeType === RouteType.LOOP ? '' : `end-${Date.now()}`, // LOOP일 때는 addWaypoint에서 ID 생성
      name: stationMetaData!.name,
      address: stationMetaData!.address,
      latitude: stationMetaData!.latitude!,
      longitude: stationMetaData!.longitude!,
    };

    if (routeType === RouteType.LOOP) {
      // 루프 모드: 반환점(경유지) 추가 - ID는 addWaypoint에서 자동 생성
      addWaypoint(placeData);
    } else {
      // 일반 모드: 도착지 설정
      setEnd(placeData);
    }

    // RouteSelect 화면으로 이동
    globalNavigation.navigate('RouteSelect');
  };

  // 내 위치와 대여소 간 거리 계산
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (!myPosition || !stationMetaData) {
      setDistance(null);
      return;
    }
    const distance = getDistanceBetweenCoords(
      { lat: myPosition.lat, lng: myPosition.lng },
      { lat: stationMetaData.latitude, lng: stationMetaData.longitude },
    );
    setDistance(Math.round(distance));
  }, [myPosition, stationMetaData]);

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
      console.error('따릉이 앱 실행 실패:', error);
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
          {getDistanceText(distance)}
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
