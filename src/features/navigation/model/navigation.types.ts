import { Coordinates } from '@/features/map/model/map.types';
import {
  Bbox,
  Coordinate,
  Segment,
  Summary,
} from '@/features/routing/model/routing.types';
export interface VolumeState {
  systemVolume: number;
  setSystemVolume: (volume: number) => void;
}

// API 관련 타입

export interface NavigationInstruction {
  distance: number; // in meters
  time: number; // in seconds
  text: string;
  sign: number;
  interval: [number, number]; // [startIndex, endIndex] in coordinates array
  nextTurnCoordinate: Coordinates;
  ttsUrl: string;
}
export interface StartNavigationSessionPayload {
  routeId: string;
}

export interface StartNavigationSessionResponse {
  statusCode: number;
  message: string;
  data: {
    sessionId: string;
    coordinates: [number, number][];
    instructions: NavigationInstruction[];
    segments: Segment[];
  };
}

// 내비게이션 세션 유지

export interface keepNavigationSessionAlivePayload {
  sessionId: string;
}

export interface keepNavigationSessionAliveResponse {
  statusCode: number;
  message: string;
}

// 내비게이션 세션 종료
export interface TerminateNavigationSessionPayload {
  sessionId: string;
}

export interface TerminateNavigationSessionResponse {
  statusCode: number;
  message: string;
}

// 기존 경로 복귀

interface StationDataForNav {
  stationId: string;
  stationName: string;
  location: Coordinates;
}
export interface ReturnToExistingRoutePayload {
  sessionId: string;
  currentLocation: Coordinates;
  remainingWaypoints?: Coordinates[];
}
export interface ReturnToExistingRouteResponse {
  statusCode: number;
  message: string;
  data: {
    routeCategory: string;
    summary: Summary;
    bbox: Bbox;
    startStation: StationDataForNav;
    endStation: StationDataForNav;
    waypoints?: Coordinates[];
    coordinates: [number, number][];
    instructions: NavigationInstruction[];
    segments: Segment[];
  };
}

// 완전 재탐색
export interface ReRoutePayload {
  sessionId: string;
  currentLocation: Coordinates;
  remainingWaypoints?: Coordinates[];
}

export interface ReRouteResponse {
  statusCode: number;
  message: string;
  data: {
    routeCategory: string;
    summary: Summary;
    bbox: Bbox;
    startStation: StationDataForNav;
    endStation: StationDataForNav;
    waypoints?: Coordinates[];
    coordinates: [number, number][];
    instructions: NavigationInstruction[];
    segments: Segment[];
  };
}

// useNavigationOrchestrator 내부 상태 타입
export interface IntervalPathData {
  intervalIndex: number;
  interval: [number, number];
  coordinateList: Coordinates[];
}

export interface LocationMetaData {
  timestamp: number;
  accuracy?: number;
  osSpeed?: number;
  coordinate: Coordinate;
}

export interface StabilizeDistanceInput {
  newlyComputedDistanceMeter: number;
  prevStableDistanceMeter: number;
  prevMyPosition: Coordinate | null;
  currentMyPosition: Coordinate;
  prevTimestamp: number | null;
  currentTimestamp: number;
  type: 'traveled' | 'remaining';
}

// calculateMotionVector 결과 타입
export type MotionVectorResult = {
  moveMag: number; // 이동거리(m)
  speedMps: number; // 속도(m/s)
  dot: number; // v·u
};

// useTimer 훅에서 사용하는 타입
export type TimerStatus = 'idle' | 'running' | 'paused';
