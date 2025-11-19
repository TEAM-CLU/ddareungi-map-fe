import { AutocompleteResult } from '@/features/search/model/search.types';

export enum RouteType {
  CONSTANT = 'constant',
  LOOP = 'loop',
}

export interface RoutePoint {
  /**
   * 입력 필드를 고유하게 식별하는 문자열 ID
   * - 출발지 : "start"
   * - 도착지 : "end"
   * - 경유지 : "waypoint-{number}"
   */
  fieldKey: string;
  placeholder?: string;
  value: string;
  type: 'start' | 'waypoint' | 'end';
}

export type RouteData = { [key: string]: AutocompleteResult };

/********** API 타입 **********/
export interface Coordinate {
  lat: number;
  lng: number;
}

// 경로 요약 (전체 요약 정보)
export interface Summary {
  distance: number;
  time: number;
  ascent: number;
  descent: number;
  bikeRoadRatio: number;
  maxGradient: number;
}

// 구간의 최소/최대 좌표 영역
export interface Bbox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

// 따릉이 대여소 정보
export interface Station {
  number: string;
  name: string;
  lat: number;
  lng: number;
  current_bikes: number;
}

export type Segment = WalkingSegment | BikingSegment;

// 도보 구간 타입
interface WalkingSegment {
  type: 'walking';
  summary: WalkingSegmentSummary;
  bbox: Bbox;
  geometry: Geometry;
}

// 자전거 구간 타입
interface BikingSegment {
  type: 'biking';
  summary: BikingSegmentSummary;
  bbox: Bbox;
  geometry: Geometry;
  profile: 'safe_bike' | 'fast_bike';
}

// 도보 구간의 summary 타입
interface WalkingSegmentSummary {
  distance: number;
  time: number;
  ascent: number;
  descent: number;
}

// 자전거 구간의 summary 타입
interface BikingSegmentSummary {
  distance: number;
  time: number;
  ascent: number;
  descent: number;
  bikeRoadRatio: number;
  maxGradient: number;
}

// 구간 경로 좌표
export interface Geometry {
  /** [lng, lat, elevation] 배열 */
  points: [number, number, number][];
}

/********** 경로 탐색 **********/
// 통합 경로 탐색 요청 페이로드
export interface FullJourneyPayload {
  start: Coordinate;
  end: Coordinate;
  waypoints?: Coordinate[];
}

// 원형 경로 탐색 요청 페이로드
export interface CircularJourneyPayload {
  start: Coordinate;
  targetDistance: number;
}

// 통합/원형 경로 탐색 응답 타입
export interface RouteResponse {
  message: string;
  data?: Route[];
}

// 경로 객체 타입
export interface Route {
  routeCategory: string;
  routeId: string;
  summary: Summary;
  bbox: Bbox;
  startStation: Station;
  endStation?: Station;
  segments: Segment[];
}

/**
 * 경유지(Waypoint) 데이터 구조
 * - id: 리스트 렌더링을 위한 고유 키 (예: 'waypoint-0')
 * - place: 실제 장소 데이터 (AutocompleteResult)
 */
export interface Waypoint {
  waypointKey: string;
  place: AutocompleteResult | null;
}

// ---------------- 스토어 ------------------

export interface RouteState {
  // --- [Data State] 기본 경로 데이터 ---
  routeType: RouteType; // 경로 모드 (LOOP / CONSTANT)
  start: AutocompleteResult | null; // 출발지
  end: AutocompleteResult | null; // 도착지
  waypoints: Waypoint[]; // 경유지 목록
  distance: number | null; // 목표 거리 (왕복 모드용)

  // --- [Acitivity Data State] 활동 관련 데이터 ---
  totalCaloriesBurned: number | null; // 예상 소모 칼로리
  totalTrees: number | null; // 예상 나무 심기 효과

  // --- [UI State] 화면 제어 상태 ---
  showSearchOverlay: boolean; // 검색창 노출 여부
  currentSelectedPoint: RoutePoint | null; // 현재 선택된 포인트 정보
  currentFieldType: 'start' | 'end' | 'waypoint' | null; // 현재 활성화된 입력 필드 타입

  // --- [API State] 비동기 통신 상태 ---
  routes: RouteResponse | null; // 서버로부터 받은 검색된 경로 결과
  selectedRouteData: Route | null; // 사용자가 선택한 경로 데이터
  isLoadingRoutes: boolean; // 로딩 중 여부
  routeSearchError: string | null; // 에러 메시지

  // --- [Basic Actions] 기본 설정 액션 ---
  setRouteType: (type: RouteType) => void;
  setStart: (place: AutocompleteResult) => void;
  setEnd: (place: AutocompleteResult) => void;
  setDistance: (distance: number) => void;
  setSelectedRouteData: (route: Route | null) => void;

  // --- [Acitivity Data Actions] 활동 관련 데이터 액션 ---
  setTotalCaloriesBurned: (calories: number | null) => void;
  setTotalTrees: (trees: number | null) => void;

  // --- [Waypoint Actions] 경유지 조작 액션 ---
  addWaypoint: (place: AutocompleteResult) => void;
  removeWaypoint: (id: string) => void;
  updateWaypoint: (id: string, place: AutocompleteResult) => void;
  reorderWaypoints: (newOrder: string[]) => void;

  // --- [System Actions] 초기화 및 UI 제어 ---
  clearAllRoutes: () => void;
  setShowSearchOverlay: (show: boolean) => void;
  setCurrentSelectedPoint: (point: RoutePoint | null) => void;
  setCurrentFieldType: (type: 'start' | 'end' | 'waypoint' | null) => void;

  // --- [Async Actions] API 호출 액션 ---
  searchRoutes: () => Promise<void>; // 일반 경로 검색
  searchCircularRoutes: () => Promise<void>; // 원형(왕복) 경로 검색
  resetRouteSearch: () => void; // 검색 결과만 초기화

  // --- [Utility Actions] 편의 기능 ---
  syncStartEndInLoopMode: (
    newPlace: AutocompleteResult,
    fieldType: 'start' | 'end',
  ) => void;
  resetAllData: () => void; // 스토어 전체 초기화
  isRouteComplete: () => boolean; // 검색 가능 상태인지 확인
  hasAnyRouteData: () => boolean; // 데이터 존재 여부 확인
}
