import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { IconBicycle } from '@/shared/components/icons';
import { RouteType } from '@/features/routing/model/routing.types';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { useBookmarkStore } from '@/features/bookmark/stores/useBookmarkStore';
import { PlaceInfo } from '../model/search.types';
import { useNearbyStationsQuery } from '@/features/station/services/station.queries';
import { getDistanceGuideText } from '@/shared/utils/formatting';
import { getDistanceBetweenCoords } from '@/shared/utils/measure';
import BookmarkToggle from '@/features/bookmark/components/BookmarkToggle';
import { usePlaceRouteApplyActions } from '@/features/search/hooks/usePlaceRouteApplyActions';
import { createPlaceBookmark } from '@/features/search/utils/createPlaceBookmark';

export interface PlaceDetailModalProps {
  place: PlaceInfo | null;
  onClose?: () => void;
}

const PlaceDetailModal = ({ place, onClose }: PlaceDetailModalProps) => {
  if (!place) {
    return (
      <View style={tw('flex justify-center w-full flex-1 items-center')}>
        <ActivityIndicator size="large" color="#C4C4C4" />
      </View>
    );
  }

  const { data: nearbyStationDataList, isLoading: isStationLoading } =
    useNearbyStationsQuery(place.latitude, place.longitude);
  const locationMetaData = useMyPositionStore(state => state.locationMetaData);
  const myPosition = locationMetaData?.coordinate;
  const toggleBookmark = useBookmarkStore(state => state.toggleBookmark);
  const bookmarked = useBookmarkStore(state =>
    place.placeId
      ? state.bookmarks.some(item => item.id === place.placeId)
      : false,
  );
  const {
    toggleAnimation,
    routeType,
    handleToggleRouteTypePress,
    handleApplyConstantRoutePress,
    handleApplyLoopRoutePress,
  } = usePlaceRouteApplyActions({ place, onClose });

  const nearestStation = useMemo(() => {
    if (!nearbyStationDataList || nearbyStationDataList.length === 0)
      return null;
    return nearbyStationDataList[0];
  }, [nearbyStationDataList]);

  const [placeDistanceMeter, setPlaceDistanceMeter] = useState<
    number | null | undefined
  >(null);

  useEffect(() => {
    if (!myPosition || !place.latitude || !place.longitude) {
      setPlaceDistanceMeter(undefined);
      return;
    }
    setPlaceDistanceMeter(null); // 로딩중
    try {
      const distanceMeter = getDistanceBetweenCoords(
        { lat: myPosition.lat, lng: myPosition.lng },
        { lat: place.latitude, lng: place.longitude },
      );
      setPlaceDistanceMeter(Math.round(distanceMeter));
    } catch (error) {
      setPlaceDistanceMeter(undefined);
      console.error('Error calculating distance:', error);
    }
  }, [myPosition, place]);

  /*
    북마크 토글 핸들러
  */
  const handleToggleBookmark = () => {
    const bookmarkItem = createPlaceBookmark(place);
    const result = toggleBookmark(bookmarkItem);
    if (result === 'limit_reached') {
      Alert.alert(
        '즐겨찾기 최대 개수 초과',
        '즐겨찾기는 최대 10개까지 등록할 수 있습니다. 기존 즐겨찾기를 삭제한 후 다시 시도해주세요.',
      );
    } else if (result === 'added') {
      console.log('즐겨찾기 추가됨');
    }
  };

  return (
    <View style={tw('flex-1')}>
      <View style={tw('flex-row justify-between items-start mb-1')}>
        <View style={tw('flex-1 mr-3')}>
          {/* 장소명과 카테고리 */}
          <View style={tw('flex-1 items-start')}>
            <Text
              style={tw(
                'text-2xl font-primary-700 text-on-surface-primary mr-3',
              )}
            >
              {place.name}
            </Text>
            {place.category ? (
              <Text
                style={tw('text-sm font-primary-600 text-on-surface-tertiary')}
              >
                {place.category}
              </Text>
            ) : (
              <View style={{ height: 4 }} />
            )}
          </View>
        </View>
        <BookmarkToggle active={bookmarked} onToggle={handleToggleBookmark} />
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
              {getDistanceGuideText(placeDistanceMeter)}
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
          {isStationLoading ? (
            '주변 대여소 찾는 중...'
          ) : nearestStation ? (
            <>
              {nearestStation.number}. {nearestStation.name}까지{' '}
              {getDistanceGuideText(nearestStation.distance)}
            </>
          ) : (
            '주변에 대여소가 없어요'
          )}
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
    </View>
  );
};

export default PlaceDetailModal;
