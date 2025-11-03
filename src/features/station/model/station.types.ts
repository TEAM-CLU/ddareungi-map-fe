import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RefObject } from 'react';
import WebView from 'react-native-webview';

// 가장 가까운 대여소 3개 검색
export interface NearbyStationsData {
  name: string;
  number: string;
  address: string;
  latitude: number;
  longitude: number;
  current_bikes: number;
}

export interface NearbyStationsPayload {
  latitude: number;
  longitude: number;
}

export interface NearbyStationsResponse {
  statusCode: number;
  message: string;
  data: NearbyStationsData[];
}

// 지도 특정 영역 내 대여소 조회
export interface MapAreaStationsData {
  name: string;
  number: string;
  address: string;
  latitude: number;
  longitude: number;
  current_bikes: number;
}
export interface MapAreaStationsPayload {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface MapAreaStationsResponse {
  statusCode: number;
  message: string;
  data: MapAreaStationsData[];
}

export interface MapAreaQueryPayload {
  lat: number | null | undefined;
  lon: number | null | undefined;
  radius: number;
  enable?: boolean;
}

// 대여소 재고 정보 조회
export interface StationsLatestBikeCountData {
  station_number: string;
  currentBikes: number;
}
export interface GetStationsLatestBikeCountPayload {
  stationNumbers: string[];
}

export interface GetStationsLatestBikeCountResponse {
  statusCode: number;
  message: string;
  data: StationsLatestBikeCountData[];
}

// useStation hook 내부 상태 타입
export interface UseStationsProps {
  webRef: RefObject<WebView | null>;
  isMapReady: boolean;
  setStationMetaData?: React.Dispatch<
    React.SetStateAction<MapAreaStationsData | null>
  >;
  stationDetailModalRef?: RefObject<BottomSheetModal | null>;
}
