import React, { useCallback, useEffect } from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import RouteInputBar from '@/features/routing/components/RouteInputBar';
import SearchOverlay from '@/features/search/components/SearchOverlay';
import { RoutePoint, RouteType } from '@/features/routing/model/routing.types';
import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';
import {
  RouteProp,
  useRoute,
  useNavigation,
  NavigationProp,
} from '@react-navigation/native';
import { RootStackParamList } from '../types';
import RouteSelectContainer from '@/features/routing/components/RouteSelectContainer';
import RouteTimeRefreshBar from '@/features/routing/components/RouteTimeRefreshBar';
import { useRouteStore } from '@/features/routing/stores/routeStore';

type RouteSelectScreenRouteProp = RouteProp<RootStackParamList, 'RouteSelect'>;
type RouteSelectScreenNavigationProp = NavigationProp<RootStackParamList>;

const RouteSelectScreen = () => {
  const route = useRoute<RouteSelectScreenRouteProp>();
  const navigation = useNavigation<RouteSelectScreenNavigationProp>();

  const {
    routeType,
    setRouteType,
    start,
    end,
    waypoints,

    setStart,
    setEnd,

    addWaypoint,
    removeWaypoint,
    updateWaypoint,

    syncStartEndInLoopMode,
    isRouteComplete,

    showSearchOverlay,
    setShowSearchOverlay,

    currentSelectedPoint,
    setCurrentSelectedPoint,
    currentFieldType,
    setCurrentFieldType,

    routes,
    isLoadingRoutes,
    routeSearchError,
    searchRoutes,
    resetRouteInputData,
    resetAllData,
    hasAnyRouteData,
  } = useRouteStore();

  // 현재 편집 중인 인풋 필드
  const [currentEditingPoint, setCurrentEditingPoint] =
    React.useState<RoutePoint | null>(null);

  // 1. route params에서 routeType 먼저 설정
  useEffect(() => {
    if (route.params?.routeType) {
      setRouteType(route.params.routeType);
    }
  }, [route.params?.routeType, setRouteType]);

  // Map에서 장소 선택 후 돌아온 경우 반영
  // placeType: 'start' | 'end' | 'waypoint-1 | 'waypoint-2' | ... | 'auto' 로 넘김
  // selectedPlace: AutocompleteResult
  useEffect(() => {
    if (route.params?.selectedPlace && route.params?.placeType) {
      const { selectedPlace, placeType } = route.params;

      Alert.alert('[RouteSelectScreen] 장소 선택됨:', JSON.stringify({
        placeType,
        placeName: selectedPlace.name,
        currentWaypointsCount: waypoints.length,
      }));

      // 'auto' 타입이면 첫 번째 빈 필드에 자동 할당
      if (placeType === 'auto') {
        if (!start?.name) {
          setStart(selectedPlace);
        } else if (routeType === RouteType.CONSTANT && !end?.name) {
          setEnd(selectedPlace);
        } else {
          // 경유지 자동 채우기
          const emptyIndex = waypoints.findIndex(wp => !wp.place?.name);
          if (emptyIndex !== -1) {
            const targetId = `waypoint-${emptyIndex}`;
            updateWaypoint(targetId, selectedPlace);
          } else if (waypoints.length < 3) {
            addWaypoint(selectedPlace);
          }
        }
        // params 초기화
        navigation.setParams({
          selectedPlace: undefined,
          placeType: undefined,
        } as any);
        return;
      }

      // LOOP 모드에서 출발지/도착지 동기화 (중복 실행 방지)
      if (
        routeType === RouteType.LOOP &&
        (placeType === 'start' || placeType === 'end')
      ) {
        syncStartEndInLoopMode(selectedPlace, placeType);
        // params 초기화
        navigation.setParams({
          selectedPlace: undefined,
          placeType: undefined,
        } as any);
        return;
      }

      // 일반적인 필드 할당
      if (placeType === 'start') {
        setStart(selectedPlace);
      } else if (placeType === 'end') {
        setEnd(selectedPlace);
      } else if (placeType === 'waypoint-new') {
        // 새로운 경유지 추가
        Alert.alert('[RouteSelectScreen] 새로운 경유지 추가');
        addWaypoint(selectedPlace);
      } else if (placeType.startsWith('waypoint-')) {
        // 기존 경유지 업데이트 (id 직접 전달)
        Alert.alert('[RouteSelectScreen] 기존 경유지 업데이트:', placeType);
        updateWaypoint(placeType, selectedPlace);
      }

      // params 초기화
      navigation.setParams({
        selectedPlace: undefined,
        placeType: undefined,
      } as any);
    }
  }, [route.params?.selectedPlace, route.params?.placeType]);

  // 경로 완성 시 자동 검색
  useEffect(() => {
    if (isRouteComplete()) {
      searchRoutes();
    }
  }, [start, end, waypoints, isRouteComplete, searchRoutes]);

  // 특정 인풋(출발/도착/경유) 눌렀을 때 Map으로 이동해서 검색 시작
  const handleRoutePointPress = useCallback(
    (point: RoutePoint) => {
      // 어떤 필드를 수정 중인지 상태로 보관
      setCurrentEditingPoint(point);

      navigation.navigate('Map', {
        openSearchOverlay: true,
        placeType: point.id, // 'start' | 'end' | 'waypoint-0'
        returnTo: 'RouteSelect',
      });
    },
    [navigation],
  );

  // 경유지 추가 버튼에서 부를 헬퍼:
  // 1) Map으로 이동해서 장소 선택
  // 2) 돌아오면 새 경유지로 추가
  const handleAddNewWaypointAndEdit = useCallback(() => {
    if (waypoints.length >= 3) {
      Alert.alert('경유지는 최대 3개까지 추가할 수 있습니다.');
      return;
    }

    // 빈 경유지를 미리 추가하지 않고 Map으로 바로 이동
    // placeType을 'waypoint-new'로 설정해서 새로운 경유지임을 표시
    navigation.navigate('Map', {
      openSearchOverlay: true,
      placeType: 'waypoint-new', // 새로운 경유지 추가용
      returnTo: 'RouteSelect',
    });
  }, [navigation, waypoints.length]);

  // 경유지 제거하면 배열에서도 빼줘야 하므로 내려줄 핸들러
  const handleRemoveWaypointFromParent = useCallback(
    (index: number) => {
      const targetId = `waypoint-${index}`;
      removeWaypoint(targetId);
    },
    [removeWaypoint],
  );

  // SearchOverlay에서 장소 선택 시 해당 필드에 입력하고 SearchOverlay 닫기
  const handlePlaceSelect = useCallback(
    (place: AutocompleteResult) => {
      if (!currentSelectedPoint || !currentFieldType) return;

      if (currentFieldType === 'start') {
        routeType === RouteType.LOOP
          ? syncStartEndInLoopMode(place, 'start')
          : setStart(place);
      } else if (currentFieldType === 'end') {
        routeType === RouteType.LOOP
          ? syncStartEndInLoopMode(place, 'end')
          : setEnd(place);
      } else if (currentFieldType === 'waypoint') {
        updateWaypoint(currentSelectedPoint.id, place);
      }

      setShowSearchOverlay(false);
      setCurrentSelectedPoint(null);
      setCurrentFieldType(null);
    },
    [
      currentSelectedPoint,
      currentFieldType,
      routeType,
      syncStartEndInLoopMode,
      setStart,
      setEnd,
      updateWaypoint,
      setShowSearchOverlay,
      setCurrentSelectedPoint,
      setCurrentFieldType,
    ],
  );

  // SearchOverlay 닫기
  const handleSearchClose = useCallback(() => {
    setShowSearchOverlay(false);
    setCurrentSelectedPoint(null);
    setCurrentFieldType(null);
  }, [setShowSearchOverlay, setCurrentSelectedPoint, setCurrentFieldType]);

  // RouteInputBar 닫기 및 초기화 처리
  const handleRouteInputBarClose = useCallback(() => {
    resetRouteInputData();
    navigation.goBack();
  }, [resetRouteInputData, navigation]);

  // RouteInputBar 데이터 초기화 처리 - Zustand store 사용
  const handleRouteDataReset = () => {
    // resetAllData를 사용하거나 개별적으로 리셋
    useRouteStore.getState().resetAllData();
    setCurrentSelectedPoint(null);
  };

  return (
    <View style={tw('flex-1 bg-white')}>
      {/* 상단 RouteInputBar 영역 */}
      {!showSearchOverlay && (
        <View style={tw('bg-brand-primary w-full pt-16 pb-4')}>
          <View style={tw('mx-2')}>
            <RouteInputBar
              onRoutePointPress={handleRoutePointPress}
              onAddWaypointAndEdit={handleAddNewWaypointAndEdit}
              onClose={handleRouteInputBarClose}
            />
          </View>
        </View>
      )}

      {/* SearchOverlay */}
      <SearchOverlay
        isVisible={showSearchOverlay}
        onClose={handleSearchClose}
        onPlaceSelect={handlePlaceSelect}
        placeholder={
          currentFieldType === 'start'
            ? '출발지를 검색하세요'
            : currentFieldType === 'end'
            ? '도착지를 검색하세요'
            : '경유지를 검색하세요'
        }
      />

      {!showSearchOverlay && (
        <>
          <RouteTimeRefreshBar />
          <RouteSelectContainer
            routes={routes}
            isLoading={isLoadingRoutes}
            error={routeSearchError}
          />
        </>
      )}
    </View>
  );
};

export default RouteSelectScreen;
