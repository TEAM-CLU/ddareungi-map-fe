import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';

export enum RouteType {
  CONSTANT = 'constant',
  LOOP = 'loop',
}

export interface RoutePoint {
  id: string;
  placeholder: string;
  value: string;
  type: 'start' | 'waypoint' | 'end';
}

export type RouteData = { [key: string]: AutocompleteResult };

/********** API 타입 **********/
/********** 통합 경로 탐색 **********/
export interface Coordinate {
  lat: number;
  lng: number;
}

// 통합 경로 탐색 요청 페이로드
export interface FullJourneyPayload {
  start: Coordinate;
  end: Coordinate;
  waypoints?: Coordinate[];
}

// 통합 경로 탐색 응답 타입
export interface FullJourneyResponse{
  message: string;
  data?: IntegratedRoute[];
}

// 구간의 최소/최대 좌표 영역
export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

// 구간 요약 정보
export interface SegmentSummary {
  distance: number; // 총 거리 (m)
  time: number; // 예상 소요 시간 (초)
  ascent: number; // 상승 고도 (m)
  descent: number; // 하강 고도 (m)
  bike_road_ratio?: number; // 자전거 도로 비율 (선택적)
}

// 구간 경로 좌표
export interface Geometry {
  /** [lng, lat, elevation] 배열 */
  points: [number, number, number][];
}

// 구간 단위 (걷기 / 자전거)
export interface RouteSegment {
  type: 'walking' | 'biking';
  summary: SegmentSummary;
  bbox: BoundingBox;
  geometry: Geometry;
  /** 자전거 구간의 경우 프로필 타입 추가 */
  profile?: 'safe_bike' | 'fast_bike' | string;
}

// 따릉이 대여소 정보 
export interface Station {
  number: string;
  name: string;
  lat: number;
  lng: number;
  current_bikes: number;
}

// 경로 요약 (전체 요약 정보)
export interface RouteSummary {
  distance: number;
  time: number;
  ascent: number;
  descent: number;
  bike_road_ratio?: number;
}

// 단일 통합 경로
export interface IntegratedRoute {
  routeCategory: string;
  summary: RouteSummary;
  bbox: BoundingBox;
  startStation: Station;
  endStation: Station;
  segments: RouteSegment[];
}
