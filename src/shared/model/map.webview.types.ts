// WebView와 React Native 간 통신을 타입 안정성 있게 관리
// RN 쪽에서만 import 해서 사용 (useMapWebview, useMapSearch, useMapRouting, Map.tsx)

import {
  MapAreaStationData,
  StationLatestBikeCountData,
} from '@/features/station/model/station.types';

// === 위치 관련 메시지 ===
export interface MyLocationMessage {
  type: 'myLocation';
  lat: number;
  lon: number;
  accuracy?: number;
}

export interface MyHeadingMessage {
  type: 'myHeading';
  heading: number;
}

export interface MyLocationFollowingMessage {
  type: 'myLocationFollowing';
}

export interface CompassModeMessage {
  type: 'myLocationCompassOn' | 'myLocationCompassOff';
  isCompassMode: boolean;
}

// === 검색 관련 메시지 ===
export interface ShowPlaceMarkerMessage {
  type: 'showPlaceMarker';
  lat: number;
  lng: number;
  placeName: string;
  placeInfo?: any;
}

export interface ClearCurrentPlaceMarkerMessage {
  type: 'clearCurrentPlaceMarker';
}

// === 라우팅 관련 메시지 ===
export interface UpdateRouteMessage {
  type: 'updateRoute';
  routeType: 'CONSTANT' | 'LOOP';
  points: Array<{
    id: string;
    lat: number;
    lng: number;
    name: string;
  }>;
  path?: Array<{
    lat: number;
    lng: number;
  }>;
}

export interface ClearRouteMessage {
  type: 'clearRoute';
}

export interface SetRouteTypeMessage {
  type: 'setRouteType';
  routeType: 'CONSTANT' | 'LOOP';
}

export interface MoveToRoutePointMessage {
  type: 'moveToRoutePoint';
  pointId: string;
}

// === WebView에서 React Native로 전송하는 메시지 ===
export interface MapReadyMessage {
  type: 'mapReady';
  isReady: boolean;
}

// === 대여소 관련 메시지 ===
export interface UpdateTargetedStationBikeCountListMessage {
  type: 'updateTargetedStationBikeCountList';
  stationBikeCountList: StationLatestBikeCountData[];
}

export interface UpdateStationDataListMessage {
  type: 'updateStationDataList';
  stations: MapAreaStationData[];
}

export interface ToggleStationMarkersMessage {
  type: 'toggleStationMarkers';
  isVisible: boolean;
}

export interface FocusOnTargetedNearbyStationMessage {
  type: 'focusOnTargetedNearbyStation';
  targetedStationData: MapAreaStationData;
}

// === 즐겨찾기 관련 메시지 ===
export interface ToggleBookmarkMarkersMessage {
  type: 'toggleBookmarkMarkers';
  isVisible: boolean;
}

// 모든 메시지 타입 유니온
export type WebViewMessageToRN =
  | MapReadyMessage
  | FocusOnTargetedNearbyStationMessage
  | ShowPlaceMarkerMessage
  | ClearCurrentPlaceMarkerMessage
  | UpdateRouteMessage
  | ClearRouteMessage
  | SetRouteTypeMessage
  | MoveToRoutePointMessage
  | ToggleStationMarkersMessage
  | ToggleBookmarkMarkersMessage
  | MyLocationFollowingMessage
  | CompassModeMessage
  | MyLocationMessage
  | MyHeadingMessage
  | UpdateTargetedStationBikeCountListMessage
  | UpdateStationDataListMessage;
