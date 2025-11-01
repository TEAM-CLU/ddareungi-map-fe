import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { AutocompleteResult } from '../hooks/useAutocomplete';
import { IconBicycle } from '@/shared/components/icons';
import { RouteType } from '@/features/routing/model/routing.types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/types';
import { useRouteStore } from '@/features/routing/stores/routeStore';

export interface PlaceDetailModalProps {
  place: AutocompleteResult;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  navigation: StackNavigationProp<RootStackParamList>;
  onClose?: () => void;
}

const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place,
  currentLocation,
  navigation,
  onClose,
}) => {
  // Zustand store에서 상태와 액션 가져오기
  const {
    routeType,
    setRouteType,
    setStart,
    setEnd,
    addWaypoint,
    waypoints,
    syncStartEndInLoopMode,
  } = useRouteStore();

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
      id: `start-${Date.now()}`, // 출발지는 고유 ID
      name: place.name,
      address: place.address,
      latitude: place.latitude!,
      longitude: place.longitude!,
    };

    // LOOP 모드면 출발-도착 동기화
    if (routeType === RouteType.LOOP) {
      syncStartEndInLoopMode(placeData, 'start');
    } else {
      setStart(placeData);
    }
    // RouteSelect 화면으로 이동
    navigation.navigate('RouteSelect');
  };

  // 두 번째 버튼 (반환점/도착) 핸들러
  const handleSecondButtonPress = () => {
    onClose?.(); // 모달 닫기

    const placeData: AutocompleteResult = {
      id: routeType === RouteType.LOOP ? '' : `end-${Date.now()}`, // LOOP일 때는 addWaypoint에서 ID 생성
      name: place.name,
      address: place.address,
      latitude: place.latitude!,
      longitude: place.longitude!,
    };

    if (routeType === RouteType.LOOP) {
      // 루프 모드: 반환점(경유지) 추가 - ID는 addWaypoint에서 자동 생성
      addWaypoint(placeData);
    } else {
      // 일반 모드: 도착지 설정
      setEnd(placeData);
    }

    // RouteSelect 화면으로 이동
    navigation.navigate('RouteSelect');
  };
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
              15.2km
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
          1600. 과기대 입구까지 700m
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
