import { Coordinate } from '@/shared/model/shared.types';
import { PlaceInfo } from '@/features/search/model/search.types';

export type { Coordinate };
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

export interface DraggableItem {
  id: string;
  type: 'start' | 'end' | 'waypoint';
  point: RoutePoint;
}

export type RouteData = { [key: string]: PlaceInfo };

/********** API 타입 **********/

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
}

// 자전거 구간 타입
interface BikingSegment {
  type: 'biking';
  summary: BikingSegmentSummary;
  bbox: Bbox;
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
  statusCode: number;
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
  waypoints?: Coordinate[];
  segments: Segment[];
  coordinates: [number, number][];
}

/**
 * 경유지(Waypoint) 데이터 구조
 * - id: 리스트 렌더링을 위한 고유 키 (예: 'waypoint-0')
 * - place: 실제 장소 데이터
 */
export interface Waypoint {
  waypointKey: string;
  place: PlaceInfo | null;
}

export interface RouteItem {
  key: string;
  place: PlaceInfo | null;
}
