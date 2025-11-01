import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';

export enum RouteType {
  CONSTANT = 'constant',
  LOOP = 'loop',
}

export interface RoutePoint {
  id: string;
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