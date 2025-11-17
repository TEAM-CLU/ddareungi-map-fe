import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { IconBicycle } from '@/shared/components/icons';
import { RouteType } from '@/features/routing/model/routing.types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/types';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { useMapController } from '@/shared/hooks/useMapController';
import { useNearbyStationsMutation } from '@/features/station/services/station.queries';
import {
  NearbyStationData,
  NearbyStationListPayload,
} from '@/features/station/model/station.types';
import { getDistanceBetweenCoords } from '@/features/location/utils/location';
import { NavigationProp } from '@react-navigation/native';
import { Coordinates } from '@/features/map/model/map.types';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useMapStore } from '@/features/map/stores/useMapStore';
import { AutocompleteResult } from '../model/search.types';

export interface PlaceDetailModalProps {
  place: AutocompleteResult | null;
  onClose?: () => void;
}

const PlaceDetailModal = ({ place, onClose }: PlaceDetailModalProps) => {
  const {
    routeType,
    setRouteType,
    setStart,
    setEnd,
    addWaypoint,
    syncStartEndInLoopMode,
  } = useRouteStore();

  const { globalNavigation } = useMapStore();
  const { myPosition } = useMyPositionStore();

  const { mutateAsync: fetchNearbyStationDataList } =
    useNearbyStationsMutation();
  const [statoinFullName, setStationFullName] =
    useState<string>('가져오는 중...');
  const [stationDistance, setStationDistance] = useState<number | null>(null);
  const [placeDistance, setPlaceDistance] = useState<number | null>(null);

  // --------------- 대여소 정보 적용 -----------------

  useEffect(() => {
    const applyStationNameAndDistance = async () => {
      if (!place!.latitude || !place!.latitude) return;
      try {
        const payload: NearbyStationListPayload = {
          latitude: place!.latitude!,
          longitude: place!.longitude!,
        };
        const response: NearbyStationData[] = await fetchNearbyStationDataList(
          payload,
        );
        setStationFullName(`${response[0].number}. ${response[0].name}까지`);
        setStationDistance(response[0].distance);
      } catch (error) {
        console.error('Error fetching nearby stations:', error);
      }
    };

    applyStationNameAndDistance();
  }, [place]);

  useEffect(() => {
    if (!myPosition || !place!.latitude || !place!.longitude) return;
    const distance = getDistanceBetweenCoords(
      { lat: myPosition.lat, lon: myPosition.lon },
      { lat: place!.latitude, lon: place!.longitude },
    );
    setPlaceDistance(Math.round(distance));
  }, [myPosition, place]);

  // --------------- 토글 관련 -----------------
  // LOOP <-> CONSTANT 토글
  const handleTogglePress = () => {
    const newRouteType =
      routeType === RouteType.CONSTANT ? RouteType.LOOP : RouteType.CONSTANT;
    setRouteType(newRouteType);
  };

  // 토글 애니메이션
  const toggleAnimation = useRef(
    new Animated.Value(routeType === RouteType.LOOP ? 1 : 0),
  ).current;

  // 토글 애니메이션 실행
  useEffect(() => {
    Animated.timing(toggleAnimation, {
      toValue: routeType === RouteType.LOOP ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [routeType, toggleAnimation]);

  // --------------- 버튼 핸들러 -----------------
  /* 
    첫 번째 버튼 (출발/원점) 핸들러
  */
  const handleFirstButtonPress = () => {
    onClose?.(); // 모달 닫기

    const placeData: AutocompleteResult = {
      placeKey: `start-${Date.now()}`, // 출발지는 고유 ID
      name: place!.name,
      address: place!.address,
      latitude: place!.latitude,
      longitude: place!.longitude,
    };

    // LOOP 모드: 출발-도착 동기화
    if (routeType === RouteType.LOOP) {
      syncStartEndInLoopMode(placeData, 'start');
    } else {
      setStart(placeData);
    }
    globalNavigation.navigate('RouteSelect');
  };

  /*
    두 번째 버튼 (반환점/도착) 핸들러 
  */
  const handleSecondButtonPress = () => {
    onClose?.(); // 모달 닫기

    const placeData: AutocompleteResult = {
      placeKey: routeType === RouteType.LOOP ? '' : `end-${Date.now()}`, // LOOP일 때는 addWaypoint에서 ID 생성
      name: place!.name,
      address: place!.address,
      latitude: place!.latitude!,
      longitude: place!.longitude!,
    };

    if (routeType === RouteType.LOOP) {
      // LOOP 모드: 반환점(경유지) 추가
      addWaypoint(placeData);
    } else {
      // CONSTANT 모드: 도착지 설정
      setEnd(placeData);
    }
    globalNavigation.navigate('RouteSelect');
  };

  if (!place) {
    return (
      <View style={tw('flex justify-center w-full flex-1 items-center')}>
        <ActivityIndicator size="large" color="#01DA86" />
      </View>
    );
  }

  return (
    <View style={tw('flex-1')}>
      <View style={tw('flex-row justify-between items-start mb-1')}>
        <View style={tw('flex-1 mr-3')}>
          {/* 장소명과 카테고리 */}
          <View style={tw('flex-row items-center')}>
            <Text
              style={tw(
                'text-2xl font-primary-700 text-on-surface-primary mr-3',
              )}
            >
              {place.name}
            </Text>
            {place.category && (
              <Text
                style={tw('text-sm font-primary-600 text-on-surface-tertiary')}
              >
                {place.category}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* 거리/주소 정보 */}
      <View style={tw('flex-row justify-between items-start mb-1')}>
        <View style={tw('flex-1 mr-3')}>
          <View style={tw('flex-row items-center')}>
            <Text
              style={tw(
                'text-base font-primary-600 text-on-surface-primary mr-3',
              )}
            >
              {`${
                placeDistance
                  ? placeDistance >= 1000
                    ? `${(placeDistance / 1000).toFixed(1)}km`
                    : `${Math.round(placeDistance)}m`
                  : '거리 측정 중...'
              }`}
            </Text>
            {place.address && (
              <Text
                style={tw(
                  'text-base font-primary-600 text-on-surface-quaternary mr-3',
                )}
              >
                {place.address}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* 대여소 정보 */}
      <View style={[tw('flex-row items-center mb-3'), { gap: 8 }]}>
        <IconBicycle width={30} height={30} color="#414548" />
        {/* 대여소 API 연결되면 변경 */}
        <Text style={tw('text-md font-primary-600 text-on-surface-primary')}>
          {statoinFullName}{' '}
          {`${
            stationDistance
              ? stationDistance >= 1000
                ? `${(stationDistance / 1000).toFixed(1)}km`
                : `${Math.round(stationDistance)}m`
              : '거리 측정 중...'
          }`}
        </Text>
      </View>

      {/* 출발/도착 버튼과 토글 */}
      <View style={tw('flex-row items-center justify-between')}>
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
    </View>
  );
};

export default PlaceDetailModal;
