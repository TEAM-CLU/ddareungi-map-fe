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

export interface LatestStationsInventoriesData {
  station_number: string;
  currentBikes: number;
}
export interface GetLatestStationsInventoriesPayload {
  stationNumbers: string[];
}

export interface GetLatestStationsInventoriesResponse {
  statusCode: number;
  message: string;
  data: LatestStationsInventoriesData[];
}
