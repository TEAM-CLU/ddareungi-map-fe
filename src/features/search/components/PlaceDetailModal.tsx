import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { AutocompleteResult } from '../hooks/useAutocomplete';
import { IconBicycle } from '@/shared/components/icons';
import { RouteType } from '@/features/routing/model/routing.types';

export interface PlaceDetailModalProps {
  place: AutocompleteResult;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  onSetAsStart: () => void;
  onSetAsEnd: () => void;
  onSetAsWaypoint?: () => void;
  onToggleRouteType: () => void;
  routeType: RouteType;
}

const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place,
  currentLocation,
  onSetAsStart,
  onSetAsEnd,
  onSetAsWaypoint,
  onToggleRouteType,
  routeType,
}) => {
  // 토글 애니메이션
  const toggleAnimation = React.useRef(
    new Animated.Value(routeType === RouteType.LOOP ? 1 : 0),
  ).current;

  // routeType이 변경될 때 애니메이션 실행
  React.useEffect(() => {
    Animated.timing(toggleAnimation, {
      toValue: routeType === RouteType.LOOP ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [routeType, toggleAnimation]);

  // 토글 버튼 핸들러
  const handleTogglePress = () => onToggleRouteType();

  // 첫 번째 버튼 (원점/출발) 핸들러
  const handleFirstButtonPress = () => onSetAsStart();

  // 두 번째 버튼 (반환점/도착) 핸들러
  const handleSecondButtonPress = () => {
    if (routeType === RouteType.LOOP && onSetAsWaypoint) onSetAsWaypoint();
    else onSetAsEnd();
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
