import React, { useCallback, useEffect, useState } from 'react';
import { View, Alert, TouchableOpacity, Text } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import RouteInputBar from '@/features/routing/components/RouteInputBar';
import {
  Route,
  RouteData,
  RoutePoint,
  RouteType,
} from '@/features/routing/model/routing.types';
import { RouteProp, useRoute, useFocusEffect } from '@react-navigation/native';
import RouteSelectContainer from '@/features/routing/components/RouteSelectContainer';
import RouteTimeRefreshBar from '@/features/routing/components/RouteTimeRefreshBar';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { useMapController } from '@/shared/hooks/useMapController';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import { useAppRoute } from '@/shared/hooks/useAppRoute';
import RoundButton from '@/shared/components/button/RoundButton';

const RouteSelectScreen = () => {
  const route = useAppRoute<'RouteSelect'>();
  const { navigation } = useAppNavigation();

  const {
    routeType,
    setRouteType,
    start,
    end,
    waypoints,

    setStart,
    setEnd,
    setSelectedRouteData,

    addWaypoint,
    updateWaypoint,

    syncStartEndInLoopMode,
    isRouteComplete,

    routes,
    isLoadingRoutes,
    routeSearchError,
    searchRoutes,
    resetAllData,
  } = useRouteStore();

  const { showSelectedRouteDetailModal, setShowSelectedRouteDetailModal } =
    useModalStore();

  // 경로 시간 계산 기준 시간 (리프레시 가능)
  const [baseTime, setBaseTime] = React.useState<Date>(new Date());
  // 파라미터 중복 소비 방지 플래그
  const [paramsConsumed, setParamsConsumed] = useState(true);

  // ---------- LOOP/CONSTANT 동기화 처리 ----------

  useEffect(() => {
    if (route.params?.routeType) {
      setRouteType(route.params.routeType);
    }
  }, [route.params?.routeType, setRouteType]);

  // ---------- 화면 나갔을 때 경로 데이터 초기화 ----------
  // 화면이 포커스될 때마다 파라미터 소비 준비
  useFocusEffect(
    useCallback(() => {
      setParamsConsumed(false);
    }, []),
  );

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('beforeRemove', () => {
  //     resetAllData();
  //   });

  //   return unsubscribe;
  // }, [navigation, resetAllData]);

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('beforeRemove', (e) => {
  //     // 스토어에서 직접 최신 상태를 가져옴
  //     const state = useRouteStore.getState();

  //     // 만약 모달 띄우는 중 (true)이면,
  //     // 데이터를 초기화하지 않고 그냥 리턴
  //     if (state.showSelectedRouteDetailModal) {
  //       return;
  //     }

  //     // 그 외의 경우 (사용자가 헤더의 뒤로가기 버튼을 누르는 등)
  //     // 데이터를 초기화
  //     resetAllData();
  //   });

  //   return unsubscribe;
  // }, [navigation, resetAllData]);

  // ---------- Map → RouteSelect ----------
  // ---------- Map에서 선택한 장소를 출발지/도착지/경유지에 반영 ----------

  useEffect(() => {
    if (
      route.params?.selectedPlace &&
      route.params?.placeType &&
      !paramsConsumed
    ) {
      setParamsConsumed(true);
      const { selectedPlace, placeType } = route.params;

      // auto 모드: 검색이 아닌 지도에서 핀 찍는 등에서의 로직
      // 자동으로 빈 곳을 찾아 할당
      // 필요하면 사용 -> 추후 삭제 가능
      if (placeType === 'auto') {
        // 1순위: 출발지 비어있으면 출발지로 설정
        if (!start?.name) {
          setStart(selectedPlace);
          // 2순위: CONSTANT 일 때 도착지 비어있으면 도착지로 설정
        } else if (routeType === RouteType.CONSTANT && !end?.name) {
          setEnd(selectedPlace);
        } else {
          // 3순위: LOOP 일 때 경유지로 설정
          const emptyIndex = waypoints.findIndex(wp => !wp.place?.name);
          if (emptyIndex !== -1) {
            const targetId = `waypoint-${emptyIndex}`;
            updateWaypoint(targetId, selectedPlace);
          } else if (waypoints.length < 3) {
            addWaypoint(selectedPlace);
          }
        }
        return;
      }

      // LOOP 모드
      // 출발지/도착지 동기화 처리 -> 출발지/도착지 중 하나 변경 시 다른 하나도 동일하게 설정
      if (
        routeType === RouteType.LOOP &&
        (placeType === 'start' || placeType === 'end')
      ) {
        syncStartEndInLoopMode(selectedPlace, placeType);
        return;
      }

      // 일반 지정 모드
      // 명확한 출발지/도착지/경유지 지정
      if (placeType === 'start') {
        setStart(selectedPlace);
      } else if (placeType === 'end') {
        setEnd(selectedPlace);
      } else if (placeType === 'waypoint-new') {
        addWaypoint(selectedPlace); // 새 경유지 배열에 추가
      } else if (placeType.startsWith('waypoint-')) {
        updateWaypoint(placeType, selectedPlace); // 기존 경유지 수정
      }
    }
  }, [
    route.params?.selectedPlace,
    route.params?.placeType,
    paramsConsumed,
    setParamsConsumed,
    start,
    end,
    waypoints,
    routeType,
    setStart,
    setEnd,
    addWaypoint,
    updateWaypoint,
    syncStartEndInLoopMode,
  ]);

  // ---------- Event handlers ----------

  // 출발지/도착지/경유지 입력창 터치
  // Map으로 이동하여 SearchOverlay 오픈
  const handleRoutePointPress = useCallback(
    (field: RoutePoint) => {
      navigation.navigate('Map', {
        openSearchOverlay: true,
        placeType: field.fieldKey,
        returnTo: 'RouteSelect',
      });
    },
    [navigation],
  );

  // 새로운 경유지 추가 및 편집
  const handleAddNewWaypointAndEdit = useCallback(() => {
    navigation.navigate('Map', {
      openSearchOverlay: true,
      placeType: 'waypoint-new', // 새로운 경유지 추가
      returnTo: 'RouteSelect',
    });
  }, [navigation, waypoints.length]);

  // RouteInputBar 닫기 버튼
  const handleRouteInputBarClose = useCallback(() => {
    resetAllData();
    navigation.navigate('Map');
  }, [resetAllData, navigation]);

  // 경로 검색 버튼
  const handleRouteSearchConfirm = useCallback(() => {
    if (!isRouteComplete()) {
      Alert.alert('경로 검색', '출발지, 도착지, 경유지를 모두 설정해주세요.');
      return;
    }

    searchRoutes();
  }, [isRouteComplete, searchRoutes]);

  // 검색된 경로 클릭 핸들러
  const handleRouteItemPress = useCallback(
    (selectedRouteData: Route) => {
      setSelectedRouteData(selectedRouteData);
      setShowSelectedRouteDetailModal(true);
      navigation.navigate('Map');
    },
    [navigation, setSelectedRouteData, showSelectedRouteDetailModal],
  );

  return (
    <View style={tw('flex-1 bg-surface-primary')}>
      {/* RouteInputBar */}
      <View style={tw('bg-brand-primary w-full pt-16 pb-4')}>
        <View style={tw('mx-2')}>
          <RouteInputBar
            onRoutePointPress={handleRoutePointPress}
            onAddWaypointAndEdit={handleAddNewWaypointAndEdit}
            onClose={handleRouteInputBarClose}
          />
        </View>
      </View>
      <View
        style={[
          tw(
            'bg-surface-primary flex flex-row w-full items-center justify-between px-4 py-1',
          ),
          { borderColor: '#D8D8D8', borderBottomWidth: 1 },
        ]}
      >
        <RouteTimeRefreshBar
          baseTime={baseTime}
          onRefresh={() => setBaseTime(new Date())}
        />
        <RoundButton
          title={'경로 검색하기'}
          onPress={handleRouteSearchConfirm}
          preset={'sm'}
        />
      </View>
      <RouteSelectContainer
        routes={routes}
        isLoading={isLoadingRoutes}
        error={routeSearchError}
        baseTime={baseTime}
        onRoutePress={handleRouteItemPress}
      />
    </View>
  );
};

export default RouteSelectScreen;
