import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  RoutePoint,
  RouteType,
  RouteResponse,
  FullJourneyPayload,
  CircularJourneyPayload,
  RouteData,
  Route,
  RouteState,
  Waypoint,
} from '../model/routing.types';
import { postFullJourney, postCircularJourney } from '../services/routing.api';
import { Alert } from 'react-native';
import {
  createEmptyWaypoint,
  getDefaultWaypoints,
  reindexWaypoints,
  withRouteInvalidation,
} from '../utils/routeStoreHelper';

export const useRouteStore = create<RouteState>()(
  devtools(
    (set, get) => ({
      // ----------- 초기 상태값 -----------
      routeType: RouteType.CONSTANT,
      start: null,
      end: null,
      waypoints: [],
      distance: null,

      totalCaloriesBurned: null,
      totalTrees: null,

      showSearchOverlay: false,
      showRecommendModal: false,
      showSelectedRouteDetailModal: false,
      currentSelectedPoint: null,
      currentFieldType: null,

      routes: null,
      selectedRouteData: null,
      isLoadingRoutes: false,
      routeSearchError: null,

      // ----------- 액션 -----------

      /*
        경로 타입 설정 (LOOP / CONSTANT)
      */
      setRouteType: type => {
        set(
          state => {
            // LOOP 모드 전환
            if (type === RouteType.LOOP) {
              return withRouteInvalidation({
                routeType: type,
                end: state.start,
                waypoints:
                  state.waypoints.length > 0
                    ? reindexWaypoints(state.waypoints)
                    : [createEmptyWaypoint(0)],
              });
            }

            // CONSTANT 모드 전환
            return withRouteInvalidation({
              routeType: type,
              waypoints: reindexWaypoints(
                state.waypoints.filter(wp => !!wp.place),
              ),
            });
          },
          false,
          'setRouteType',
        );
      },

      /*
        출발지 설정 (LOOP 모드 시 도착지 동기화)
       */
      setStart: place => {
        set(
          state =>
            withRouteInvalidation({
              start: place,
              end:
                state.routeType === RouteType.LOOP && place ? place : state.end,
            }),
          false,
          'setStart',
        );
      },

      /*
        도착지 설정 (LOOP 모드 시 출발지 동기화)
      */
      setEnd: place => {
        set(
          state =>
            withRouteInvalidation({
              end: place,
              start:
                state.routeType === RouteType.LOOP && place
                  ? place
                  : state.start,
            }),
          false,
          'setEnd',
        );
      },

      /*
        이동 거리 설정
      */
      setDistance: (distance: number) =>
        set(withRouteInvalidation({ distance }), false, 'setDistance'),

      /*
      선택된 경로 데이터 설정
      */
      setSelectedRouteData: (selectedRouteData: Route | null) =>
        set(
          {
            selectedRouteData: selectedRouteData,
          },
          false,
          'setSelectedRouteData',
        ),

      // ----------- 경유지 관리 (추가/삭제/수정/순서변경) -----------

      /*
      경유지 추가
      */
      addWaypoint: place =>
        set(
          state => {
            // 비어있는 경유지 슬롯 있는지 확인 (우선 채움)
            const emptyIndex = state.waypoints.findIndex(wp => !wp.place);

            if (emptyIndex !== -1) {
              const newWaypoints = [...state.waypoints];
              newWaypoints[emptyIndex] = {
                ...newWaypoints[emptyIndex],
                place,
              };
              return withRouteInvalidation({ waypoints: newWaypoints });
            }

            // 빈 슬롯 없으면 새로 추가
            const newWaypoint: Waypoint = {
              waypointKey: `waypoint-${state.waypoints.length}`,
              place,
            };
            return withRouteInvalidation({
              waypoints: [...state.waypoints, newWaypoint],
            });
          },
          false,
          'addWaypoint',
        ),

      /*
      경유지 삭제
      */
      removeWaypoint: waypointKey =>
        set(
          state => {
            const filtered = state.waypoints.filter(
              wp => wp.waypointKey !== waypointKey,
            );
            return withRouteInvalidation({
              waypoints: reindexWaypoints(filtered),
            });
          },
          false,
          'removeWaypoint',
        ),

      /*
      경유지 수정
      */
      updateWaypoint: (waypointKey, place) =>
        set(
          state =>
            withRouteInvalidation({
              waypoints: state.waypoints.map(wp =>
                wp.waypointKey === waypointKey ? { ...wp, place } : wp,
              ),
            }),
          false,
          'updateWaypoint',
        ),

      /*
      경유지 순서 변경
      */
      reorderWaypoints: (fromIndex, toIndex) =>
        set(state => {
          const newWaypoints = [...state.waypoints];
          const [moved] = newWaypoints.splice(fromIndex, 1);
          newWaypoints.splice(toIndex, 0, moved);
          return withRouteInvalidation({ waypoints: newWaypoints });
        }),

      // ----------- UI 상태 제어 -----------

      /*
      모든 경로 데이터 초기화
      */
      clearAllRoutes: () =>
        set(
          state => ({
            start: null,
            end: null,
            waypoints: getDefaultWaypoints(state.routeType),
            routes: null,
            routeSearchError: null,
          }),
          false,
          'clearAllRoutes',
        ),

      setShowSearchOverlay: (show: boolean) =>
        set({ showSearchOverlay: show }, false, 'setShowSearchOverlay'),

      setCurrentSelectedPoint: (point: RoutePoint | null) =>
        set({ currentSelectedPoint: point }, false, 'setCurrentSelectedPoint'),

      setCurrentFieldType: (type: 'start' | 'end' | 'waypoint' | null) =>
        set({ currentFieldType: type }, false, 'setCurrentFieldType'),

      // ------------- API Actions -------------

      searchRoutes: async () => {
        const { start, end, waypoints } = get();

        set(
          { isLoadingRoutes: true, routeSearchError: null },
          false,
          'searchRoutes-start',
        );

        try {
          // 1. 필수 데이터 검증
          if (!start || !end) {
            throw new Error('출발지와 도착지를 모두 설정해주세요.');
          }

          if (
            !start.latitude ||
            !start.longitude ||
            !end.latitude ||
            !end.longitude
          ) {
            throw new Error('출발지 또는 도착지의 좌표 정보가 없습니다.');
          }

          // 2. 유효한 경유지 필터링 및 가공
          const filledWaypoints = waypoints
            .filter(wp => wp.place?.latitude && wp.place?.longitude)
            .map(wp => ({
              lat: wp.place!.latitude!,
              lng: wp.place!.longitude!,
            }));

          const payload: FullJourneyPayload = {
            start: { lat: start.latitude, lng: start.longitude },
            end: { lat: end.latitude, lng: end.longitude },
            waypoints: filledWaypoints.length > 0 ? filledWaypoints : undefined,
          };

          // 3. API 호출
          const response = await postFullJourney(payload);
          set(
            { routes: response, isLoadingRoutes: false },
            false,
            'searchRoutes-success',
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : '경로 검색 중 오류가 발생했습니다.';
          Alert.alert('경로 검색 실패', errorMessage);
          set(
            { routeSearchError: errorMessage, isLoadingRoutes: false },
            false,
            'searchRoutes-error',
          );
        }
      },

      searchCircularRoutes: async () => {
        const { start, distance } = get();
        set(
          { isLoadingRoutes: true, routeSearchError: null },
          false,
          'searchCircularRoutes-start',
        );

        try {
          // 1. 필수 데이터 검증
          if (!start?.latitude || !start?.longitude)
            throw new Error('출발지 좌표가 필요합니다.');
          if (!distance || distance <= 0)
            throw new Error('이동 거리를 설정해주세요.');

          // 2. 페이로드 구성
          const payload: CircularJourneyPayload = {
            start: {
              lat: start.latitude,
              lng: start.longitude,
            },
            targetDistance: distance * 1000, // km를 m로 변환
          };

          // 3. API 호출
          const response = await postCircularJourney(payload);
          set(
            { routes: response, isLoadingRoutes: false },
            false,
            'searchCircularRoutes-success',
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : '원형 경로 검색 중 오류가 발생했습니다.';
          Alert.alert('원형 경로 검색 실패', errorMessage);
          set(
            { routeSearchError: errorMessage, isLoadingRoutes: false },
            false,
            'searchCircularRoutes-error',
          );
        }
      },

      resetRouteSearch: () =>
        set(
          { routes: null, routeSearchError: null },
          false,
          'resetRouteSearch',
        ),

      // ----------- 활동 관련 데이터 설정 -------------

      setTotalCaloriesBurned: (calories: number | null) =>
        set({ totalCaloriesBurned: calories }, false, 'setTotalCaloriesBurned'),

      setTotalTrees: (trees: number | null) =>
        set({ totalTrees: trees }, false, 'setTotalTrees'),

      // ------------- 기타 편의 기능 -------------

      syncStartEndInLoopMode: newPlace => {
        if (get().routeType !== RouteType.LOOP) return;
        set(
          {
            start: newPlace,
            end: newPlace,
            routes: null,
            routeSearchError: null,
          },
          false,
          'syncStartEndInLoopMode',
        );
      },

      resetAllData: () => {
        const { routeType } = get();
        set(
          {
            start: null,
            end: null,
            waypoints:
              routeType === RouteType.LOOP ? [createEmptyWaypoint(0)] : [],
            distance: null,
            routes: null,
            totalCaloriesBurned: null,
            totalTrees: null,
            routeSearchError: null,
            showSearchOverlay: false,
            currentSelectedPoint: null,
            currentFieldType: null,
            selectedRouteData: null,
          },
          false,
          'resetAllData',
        );
      },

      // 경로 완성 여부 체크
      isRouteComplete: () => {
        const { routeType, start, end, waypoints } = get();
        const allWaypointsFilled = waypoints.every(w => !!w.place?.name);

        if (routeType === RouteType.CONSTANT) {
          return !!start && !!end && (!waypoints.length || allWaypointsFilled);
        }
        if (routeType === RouteType.LOOP) {
          return !!start && waypoints.length > 0 && allWaypointsFilled;
        }
        return false;
      },

      // 경로 데이터가 하나라도 있는지 체크 (PlaceDetailModal 스킵 판단용)
      hasAnyRouteData: () => {
        const { start, end, waypoints } = get();
        return (
          !!start?.name || !!end?.name || waypoints.some(wp => !!wp.place?.name)
        );
      },
    }),
    { name: 'route-store' },
  ),
);
