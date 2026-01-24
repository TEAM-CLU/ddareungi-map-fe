import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  RoutePoint,
  RouteType,
  Route,
  Waypoint,
  RouteItem,
} from '../model/routing.types';
import {
  createEmptyWaypoint,
  getDefaultWaypoints,
  reindexWaypoints,
  withRouteInvalidation,
} from '../utils/routeStoreHelper';
import { PlaceInfo } from '@/features/search/model/search.types';

export interface RouteState {
  // --- [Data State] 기본 경로 데이터 ---
  routeType: RouteType; // 경로 모드 (LOOP / CONSTANT)
  start: PlaceInfo | null; // 출발지
  end: PlaceInfo | null; // 도착지
  waypoints: Waypoint[]; // 경유지 목록
  distance: number | null; // 목표 거리 (왕복 모드용)
  getItems: () => RouteItem[];

  // --- [Acitivity Data State] 활동 관련 데이터 ---
  totalCaloriesBurned: number | null; // 예상 소모 칼로리
  totalTrees: number | null; // 예상 나무 심기 효과

  // --- [UI State] 화면 제어 상태 ---
  currentSelectedPoint: RoutePoint | null; // 현재 선택된 포인트 정보
  currentFieldType: 'start' | 'end' | 'waypoint' | null; // 현재 활성화된 입력 필드 타입
  prevScreen: 'RouteSelect' | 'RouteRecommend' | null; // 이전 화면 정보 판정을 통한 뒤로가기 버튼 누를시 돌아갈 화면 지정

  // --- [API State] 비동기 통신 상태 ---
  // routes: RouteResponse | null; // 서버로부터 받은 검색된 경로 결과
  selectedRouteData: Route | null; // 사용자가 선택한 경로 데이터
  // isLoadingRoutes: boolean; // 로딩 중 여부
  // routeSearchError: string | null; // 에러 메시지

  // --- [Basic Actions] 기본 설정 액션 ---
  setRouteType: (type: RouteType) => void;
  setStart: (place: PlaceInfo | null) => void;
  setEnd: (place: PlaceInfo | null) => void;
  setDistance: (distance: number) => void;
  setSelectedRouteData: (route: Route | null) => void;
  setPrevScreen: (screen: 'RouteSelect' | 'RouteRecommend' | null) => void;

  // --- [Acitivity Data Actions] 활동 관련 데이터 액션 ---
  setTotalCaloriesBurned: (calories: number | null) => void;
  setTotalTrees: (trees: number | null) => void;

  // --- [Waypoint Actions] 경유지 조작 액션 ---
  addWaypoint: (place: PlaceInfo) => void;
  removeWaypoint: (id: string) => void;
  updateWaypoint: (id: string, place: PlaceInfo) => void;
  reorderWaypoints: (newWaypoints: Waypoint[]) => void; // 드래그 후 전체 경유지 배열을 통째로 교체하는 함수
  updateRouteFromDrag: (
    newStart: PlaceInfo | null,
    newEnd: PlaceInfo | null,
    newWaypoints: Waypoint[],
  ) => void; // ✅ 추가: 드래그 완료 후 start/end/waypoints를 한 번에 업데이트

  // --- [System Actions] 초기화 및 UI 제어 ---
  clearAllRoutes: () => void;
  setCurrentSelectedPoint: (point: RoutePoint | null) => void;
  setCurrentFieldType: (type: 'start' | 'end' | 'waypoint' | null) => void;

  // --- [Utility Actions] 편의 기능 ---
  syncStartEndInLoopMode: (
    newPlace: PlaceInfo,
    fieldType: 'start' | 'end',
  ) => void;
  resetAllData: () => void; // 스토어 전체 초기화
  isRouteComplete: () => boolean; // 검색 가능 상태인지 확인
  hasAnyRouteData: () => boolean; // 데이터 존재 여부 확인
}

export const useRouteStore = create<RouteState>()(
  devtools(
    (set, get) => ({
      // ----------- 초기 상태값 -----------
      routeType: RouteType.CONSTANT,
      start: null,
      end: null,
      waypoints: [],
      distance: null,

      prevScreen: null,

      totalCaloriesBurned: null,
      totalTrees: null,

      showRecommendModal: false,
      showSelectedRouteDetailModal: false,
      currentSelectedPoint: null,
      currentFieldType: null,
      selectedRouteData: null,

      // ----------- 액션 -----------

      setPrevScreen: screen =>
        set({ prevScreen: screen }, false, 'setPrevScreen'),

      getItems: () => {
        const { start, end, waypoints } = get();

        const items: RouteItem[] = [];

        items.push({
          key: 'fixed-start',
          place: start,
        });

        waypoints.forEach(wp => {
          items.push({
            key: wp.waypointKey,
            place: wp.place,
          });
        });

        items.push({
          key: 'fixed-end',
          place: end,
        });

        return items;
      },

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
      /** ⛳ 핵심: 드래그 후 전체 waypoints 재정렬 적용 */
      reorderWaypoints: newWaypoints =>
        set(
          withRouteInvalidation({
            waypoints: newWaypoints,
          }),
          false,
          'reorderWaypoints',
        ),

      updateRouteFromDrag: (newStart, newEnd, newWaypoints) =>
        set(
          withRouteInvalidation({
            start: newStart,
            end: newEnd,
            waypoints: newWaypoints,
          }),
          false,
          'updateRouteFromDrag',
        ),
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
          }),
          false,
          'clearAllRoutes',
        ),

      setCurrentSelectedPoint: (point: RoutePoint | null) =>
        set({ currentSelectedPoint: point }, false, 'setCurrentSelectedPoint'),

      setCurrentFieldType: (type: 'start' | 'end' | 'waypoint' | null) =>
        set({ currentFieldType: type }, false, 'setCurrentFieldType'),

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
            totalCaloriesBurned: null,
            totalTrees: null,
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
