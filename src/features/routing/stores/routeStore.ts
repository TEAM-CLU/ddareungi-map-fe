import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';
import {
  RoutePoint,
  RouteType,
  RouteResponse,
  FullJourneyPayload,
} from '../model/routing.types';
import { postFullJourney } from '../services/routing.api';
import { Alert } from 'react-native';

// Waypoint 타입 정의
interface Waypoint {
  id: string; // 경유지 고유 ID
  place: AutocompleteResult | null;
}

// Store 상태 타입 정의 - 배열 기반
interface RouteState {
  // 기본 경로 설정
  routeType: RouteType;
  start: AutocompleteResult | null;
  end: AutocompleteResult | null;
  waypoints: Waypoint[]; // 배열로 관리

  // UI 상태
  showSearchOverlay: boolean;
  currentSelectedPoint: RoutePoint | null;
  currentFieldType: 'start' | 'end' | 'waypoint' | null;

  // API 상태
  routes: RouteResponse | null;
  isLoadingRoutes: boolean;
  routeSearchError: string | null;

  // Actions
  setRouteType: (type: RouteType) => void;
  setStart: (place: AutocompleteResult) => void;
  setEnd: (place: AutocompleteResult) => void;

  addWaypoint: (place: AutocompleteResult) => void;
  removeWaypoint: (id: string) => void;
  updateWaypoint: (id: string, place: AutocompleteResult) => void;
  reorderWaypoints: (fromIndex: number, toIndex: number) => void;
  clearAllRoutes: () => void;

  // UI Actions
  setShowSearchOverlay: (show: boolean) => void;
  setCurrentSelectedPoint: (point: RoutePoint | null) => void;
  setCurrentFieldType: (type: 'start' | 'end' | 'waypoint' | null) => void;

  // API Actions
  searchRoutes: () => Promise<void>;
  resetRouteSearch: () => void;

  // Utility Actions
  syncStartEndInLoopMode: (
    newPlace: AutocompleteResult,
    fieldType: 'start' | 'end',
  ) => void;
  resetAllData: () => void;
  resetRouteInputData: () => void;
  isRouteComplete: () => boolean;
  hasAnyRouteData: () => boolean;
}

export const useRouteStore = create<RouteState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      routeType: RouteType.CONSTANT,
      start: null,
      end: null,
      waypoints: [],

      showSearchOverlay: false,
      currentSelectedPoint: null,
      currentFieldType: null,

      routes: null,
      isLoadingRoutes: false,
      routeSearchError: null,

      setRouteType: type => {
        const { start } = get();
        if (type === RouteType.LOOP) {
          // LOOP 모드로 전환 시
          // 1. start와 end를 동일하게 설정
          // 2. 기본 경유지 1개 추가 (비어있으면)
          const currentWaypoints = get().waypoints;
          const updates: Partial<RouteState> = {
            routeType: type,
            end: start, // 출발지와 도착지 동기화
          };

          if (currentWaypoints.length === 0) {
            updates.waypoints = [
              {
                id: 'waypoint-0',
                place: null,
              },
            ];
          }

          set(updates, false, 'setRouteTypeToLoop');
        } else {
          set({ routeType: type }, false, 'setRouteType');
        }
      },

      // 출발지 설정 (LOOP 모드 시 도착지 동기화)
      setStart: place => {
        set({ start: place }, false, 'setStart');
        if (get().routeType === RouteType.LOOP && place) {
          set({ end: place }, false, 'syncEndWithStart');
        }
      },

      // 도착지 설정 (LOOP 모드 시 출발지 동기화)
      setEnd: place => {
        set({ end: place }, false, 'setEnd');
        if (get().routeType === RouteType.LOOP && place) {
          set({ start: place }, false, 'syncStartWithEnd');
        }
      },

      // 경유지 추가 (최대 3개)
      addWaypoint: place =>
        set(
          state => {
            if (state.waypoints.length >= 3) {
              Alert.alert('최대 경유지 개수를 초과했습니다.');
              return state;
            }
            const newWaypoint: Waypoint = {
              id: `waypoint-${state.waypoints.length}`,
              place,
            };
            return { waypoints: [...state.waypoints, newWaypoint] };
          },
          false,
          'addWaypoint',
        ),

      // 경유지 삭제
      removeWaypoint: id =>
        set(
          state => {
            const filtered = state.waypoints.filter(wp => wp.id !== id);

            if (state.routeType === RouteType.LOOP && filtered.length === 0) {
              Alert.alert('LOOP 모드에서는 최소 1개의 경유지가 필요합니다.');
              return state;
            }

            // 인덱스 재정렬 (id 순서 재생성)
            const reIndexed = filtered.map((wp, i) => ({
              ...wp,
              id: `waypoint-${i}`,
            }));

            return { waypoints: reIndexed };
          },
          false,
          'removeWaypoint',
        ),

      updateWaypoint: (id, place) =>
        set(
          state => ({
            waypoints: state.waypoints.map(wp =>
              wp.id === id ? { ...wp, place } : wp,
            ),
          }),
          false,
          'updateWaypoint',
        ),

      // 경유지 순서 변경
      reorderWaypoints: (fromIndex, toIndex) =>
        set(state => {
          const newWaypoints = [...state.waypoints];
          const [moved] = newWaypoints.splice(fromIndex, 1);
          newWaypoints.splice(toIndex, 0, moved);
          return { waypoints: newWaypoints };
        }),

      clearAllRoutes: () =>
        set(
          {
            start: null,
            end: null,
            waypoints: [],
            routes: null,
            routeSearchError: null,
          },
          false,
          'clearAllRoutes',
        ),

      // UI Actions
      setShowSearchOverlay: (show: boolean) =>
        set({ showSearchOverlay: show }, false, 'setShowSearchOverlay'),

      setCurrentSelectedPoint: (point: RoutePoint | null) =>
        set({ currentSelectedPoint: point }, false, 'setCurrentSelectedPoint'),

      setCurrentFieldType: (type: 'start' | 'end' | 'waypoint' | null) =>
        set({ currentFieldType: type }, false, 'setCurrentFieldType'),

      // API Actions
      searchRoutes: async () => {
        const { start, end, waypoints } = get();

        set(
          { isLoadingRoutes: true, routeSearchError: null },
          false,
          'searchRoutes-start',
        );

        try {
          if (!start || !end) {
            throw new Error('출발지와 도착지를 모두 설정해주세요.');
          }

          // 실제 데이터가 있는 경유지만 필터링 (순서 유지)
          const filledWaypoints = waypoints
            .filter(
              wp =>
                wp.place &&
                wp.place.name &&
                wp.place.latitude &&
                wp.place.longitude,
            )
            .map(wp => ({
              lat: wp.place!.latitude!,
              lng: wp.place!.longitude!,
            }));

          const payload: FullJourneyPayload = {
            start: {
              lat: start.latitude || 0,
              lng: start.longitude || 0,
            },
            end: {
              lat: end.latitude || 0,
              lng: end.longitude || 0,
            },
            waypoints: filledWaypoints.length > 0 ? filledWaypoints : undefined,
          };

          console.log('[RouteStore] 경로 검색 요청:', {
            start: start.name,
            end: end.name,
            waypointsCount: filledWaypoints.length,
            payload,
          });

          const response = await postFullJourney(payload);

          console.log('[RouteStore] 경로 검색 성공:', {
            routesCount: response.data?.length || 0,
          });

          set(
            { routes: response, isLoadingRoutes: false },
            false,
            'searchRoutes-success',
          );
        } catch (error) {
          console.error('[RouteStore] 경로 검색 실패:', error);

          const errorMessage =
            error instanceof Error
              ? error.message
              : '경로 검색 중 오류가 발생했습니다.';

          set(
            {
              routeSearchError: errorMessage,
              isLoadingRoutes: false,
            },
            false,
            'searchRoutes-error',
          );
        }
      },
      resetRouteSearch: () =>
        set(
          { routes: null, routeSearchError: null },
          false,
          'resetRouteSearch',
        ),

      // Utility Actions
      syncStartEndInLoopMode: newPlace => {
        if (get().routeType !== RouteType.LOOP) return;
        set(
          { start: newPlace, end: newPlace },
          false,
          'syncStartEndInLoopMode',
        );
      },

      resetAllData: () =>
        set(
          {
            start: null,
            end: null,
            waypoints: [],
            routes: null,
            routeSearchError: null,
            showSearchOverlay: false,
            currentSelectedPoint: null,
            currentFieldType: null,
          },
          false,
          'resetAllData',
        ),

      // RouteInputBar X 버튼용 초기화 (모드별 기본 상태로 리셋)
      resetRouteInputData: () =>
        set(
          {
            start: null,
            end: null,
            waypoints: [],
            routes: null,
            routeSearchError: null,
            showSearchOverlay: false,
            currentSelectedPoint: null,
            currentFieldType: null,
          },
          false,
          'resetRouteInputData',
        ),

      // 경로 완성 여부 체크
      isRouteComplete: () => {
        const { routeType, start, end, waypoints } = get();
        const hasStart = !!start;
        const hasEnd = !!end;
        const hasWaypoints = waypoints.length > 0;
        const allFilled = waypoints.every(w => !!w.place?.name);

        if (routeType === RouteType.CONSTANT)
          return hasStart && hasEnd && (!hasWaypoints || allFilled);
        if (routeType === RouteType.LOOP)
          return hasStart && hasWaypoints && allFilled;

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
