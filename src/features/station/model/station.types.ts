import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RefObject } from 'react';
import WebView from 'react-native-webview';

// 가장 가까운 대여소 3개 검색
export interface NearbyStationData {
  name: string;
  number: string;
  address: string;
  latitude: number;
  longitude: number;
  current_bikes: number;
  distance: number;
}

export interface NearbyStationListPayload {
  latitude: number;
  longitude: number;
}

export interface NearbyStationListResponse {
  statusCode: number;
  message: string;
  data: NearbyStationData[];
}

// 지도 특정 영역 내 대여소 조회
export interface MapAreaStationData {
  name: string;
  number: string;
  address: string;
  latitude: number;
  longitude: number;
  current_bikes: number;
}
export interface MapAreaStationListPayload {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface MapAreaStationListResponse {
  statusCode: number;
  message: string;
  data: MapAreaStationData[];
}

export interface MapAreaQueryPayload {
  lat: number | null | undefined;
  lng: number | null | undefined;
  radius: number;
  enable?: boolean;
}

// 대여소 재고 정보 조회
export interface StationLatestBikeCountData {
  station_number: string;
  currentBikes: number;
}
export interface GetStationLatestBikeCountListPayload {
  stationNumbers: string[];
}

export interface GetStationLatestBikeCountListResponse {
  statusCode: number;
  message: string;
  data: StationLatestBikeCountData[];
}

// useStation hook 내부 상태 타입
export interface UseStationsOptions {
  isMapReady: boolean;
}
