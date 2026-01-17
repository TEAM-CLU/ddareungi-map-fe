// WebView와 React Native 간 통신을 타입 안정성 있게 관리

import { Coordinate, RouteType } from '@/features/routing/model/routing.types';
import {
  MapAreaStationData,
  StationLatestBikeCountData,
} from '@/features/station/model/station.types';
import { BookmarkItem } from '@/shared/model/index.types';


// === 위치 관련 메시지 ===
export interface UpdateMyLocationMessage {
  type: 'updateMyLocation';
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface RotateMyHeadingMessage {
  type: 'rotateMyHeading';
  heading: number;
}

export interface SetCenterOnMyLocationMessage {
  type: 'setCenterOnMyLocation';
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

export interface StaticPathData {
  routeType: RouteType;
  startPoint: [number, number];
  endPoint: [number, number];
  waypoints: Coordinate[] | null;
  startStationPoint: Coordinate;
  endStationPoint: Coordinate;
  pathCoordinates: [number, number][];
}

export interface StopFollowingMyLocationMessage {
  type: 'stopFollowingMyLocation';
  isSelectedRouteDetailModalOpen: boolean;
}

export interface DrawStaticPathMessage {
  type: 'drawStaticPath';
  staticPathData: StaticPathData;
}

export interface ClearStaticPathMessage {
  type: 'clearStaticPath';
}

export interface FocusOnStaticPathMessage {
  type: 'focusOnStaticPath';
}

// === 맵 준비 상태 메시지 ===

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

export interface UpdateBookmarksMessage {
  type: 'updateBookmarks';
  bookmarks: BookmarkItem[];
}

export interface ClearBookmarksMessage {
  type: 'clearBookmarks';
}

export interface FocusOnBookmarkMessage {
  type: 'focusOnBookmark';
  bookmarkId: string;
}

export interface ToggleBookmarkMarkersMessage {
  type: 'toggleBookmarkMarkers';
  isVisible: boolean;
}

export interface ShowSingleBookmarkMarkerMessage {
  type: 'showSingleBookmarkMarker';
  bookmarkData: BookmarkItem;
}
// === 내비게이션 관련 메시지 ===
export interface ReplaceMyLocationMarker {
  type: 'replaceMyLocationMarker';
  isNavigationMode: boolean;
}

export interface NavigationPathData {
  routeType: RouteType;
  startPoint: [number, number];
  endPoint: [number, number];
  waypoints: Coordinate[] | null;
  fullPathCoordinateList: [number, number][];
  intervals: [number, number][];
  currentIntervalIndex: number;
  startStationPoint: Coordinate;
  endStationPoint: Coordinate;
  walkingPolicy?: NavigationWalkingPolicy; // 도보 경로 표시 정책
}

export type NavigationWalkingPolicy = 'all' | 'only-end' | 'none';

export interface DrawNavigationPathMessage {
  type: 'drawNavigationPath';
  navigationPathData: NavigationPathData;
}

export interface UpdateNavigationCurrentIntervalMessage {
  type: 'updateNavigationCurrentInterval';
  currentIntervalIndex: number;
}

export interface ClearNavigationPathMessage {
  type: 'clearNavigationPath';
}

export interface FocusOnNavigationPathMessage {
  type: 'focusOnNavigationPath';
}

// 모든 메시지 타입 유니온
export type WebViewMessageToWeb =
  | MapReadyMessage
  | FocusOnTargetedNearbyStationMessage
  | ShowPlaceMarkerMessage
  | ClearCurrentPlaceMarkerMessage
  | DrawStaticPathMessage
  | ClearStaticPathMessage
  | FocusOnStaticPathMessage
  | ToggleStationMarkersMessage
  | SetCenterOnMyLocationMessage
  | CompassModeMessage
  | UpdateMyLocationMessage
  | RotateMyHeadingMessage
  | UpdateTargetedStationBikeCountListMessage
  | UpdateStationDataListMessage
  | UpdateBookmarksMessage
  | ToggleBookmarkMarkersMessage
  | FocusOnBookmarkMessage
  | ShowSingleBookmarkMarkerMessage
  | ClearBookmarksMessage
  | StopFollowingMyLocationMessage
  | ReplaceMyLocationMarker
  | DrawNavigationPathMessage
  | UpdateNavigationCurrentIntervalMessage
  | ClearNavigationPathMessage
  | FocusOnNavigationPathMessage;

/* === 웹뷰로부터 받아온 메시지 타입 === */

export interface MapReadyMessage {
  type: 'mapReady';
  isReady: boolean;
}

export interface ClickStationMarkerMessage {
  type: 'clickStationMarker';
  stationData: MapAreaStationData;
}

export interface NeedUpdateStationBikeCountListMessage {
  type: 'needUpdateStationBikeCountList';
  stationNumbers: string[];
}

export interface ChangeMapCenterMessage {
  type: 'changeMapCenter';
  lat: number;
  lng: number;
}
