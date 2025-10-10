// Map WebView 통신을 위한 메시지 타입 정의

export interface MapWebviewMessage {
  type: string;
  [key: string]: any;
}

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

export interface MoveToLocationMessage {
  type: 'moveToLocation';
  lat: number;
  lng: number;
  placeName: string;
}

export interface ShowSearchResultsMessage {
  type: 'showSearchResults';
  places: Array<{
    lat: number;
    lng: number;
    name: string;
    address?: string;
    category?: string;
  }>;
}

export interface ClearSearchMessage {
  type:
    | 'clearCurrentPlaceMarker'
    | 'clearSearchMarkers'
    | 'clearAllSearchElements';
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

export interface ShowPlaceDetailModalMessage {
  type: 'showPlaceDetailModal';
  place: {
    name: string;
    address: string;
    category: string;
    lat: number;
    lng: number;
    id: string;
  };
}

export interface PlaceMarkerShownMessage {
  type: 'placeMarkerShown';
  lat: number;
  lng: number;
  placeName: string;
}

export interface MapMovedToLocationMessage {
  type: 'mapMovedToLocation';
  lat: number;
  lng: number;
  placeName: string;
}

export interface RouteUpdatedMessage {
  type: 'routeUpdated';
  routeType: 'CONSTANT' | 'LOOP';
  pointsCount: number;
}

export interface RouteClearedMessage {
  type: 'routeCleared';
}

// 모든 메시지 타입 유니온
export type WebViewMessageFromRN =
  | MyLocationMessage
  | MyHeadingMessage
  | MyLocationFollowingMessage
  | CompassModeMessage
  | ShowPlaceMarkerMessage
  | MoveToLocationMessage
  | ShowSearchResultsMessage
  | ClearSearchMessage
  | UpdateRouteMessage
  | ClearRouteMessage
  | SetRouteTypeMessage
  | MoveToRoutePointMessage;

export type WebViewMessageToRN =
  | MapReadyMessage
  | ShowPlaceDetailModalMessage
  | PlaceMarkerShownMessage
  | MapMovedToLocationMessage
  | RouteUpdatedMessage
  | RouteClearedMessage;
