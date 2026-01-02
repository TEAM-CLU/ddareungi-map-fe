import { Coordinates } from '@/features/map/model/map.types';
import {
  Bbox,
  Coordinate,
  Segment,
  Summary,
} from '@/features/routing/model/routing.types';
export interface NavDetailModalState {
  systemVolume: number;
  setSystemVolume: (volume: number) => void;
  navVolume: number;
  setNavVolume: (volume: number) => void;

  setAllNavDetailModalItems: (
    modalRefs: Partial<
      Pick<
        NavDetailModalState,
        'systemVolume' | 'setSystemVolume' | 'navVolume' | 'setNavVolume'
      >
    >,
  ) => void;
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
  timestemp: number;
  accuracy?: number;
  osSpeed?: number;
  coordinate: Coordinate;
}
