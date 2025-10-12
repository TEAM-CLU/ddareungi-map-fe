// 가장 가까운 대여소 3개 검색
interface StationData {
  name: string;
  number: string;
  latitude: number;
  longitude: number;
  current_bikes: number;
}

export interface NearByStationsPayload {
  latitude: number;
  longitude: number;
}

export interface NearByStationsResponse {
  statusCode: number;
  message: string;
  data: StationData[];
}

// 지도 특정 영역 내 대여소 조회
export interface MapAreaStationsPayload {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface MapAreaStationsResponse {
  statusCode: number;
  message: string;
  data: StationData[];
}

export interface MapAreaQueryPayload {
  lat: number | null | undefined;
  lon: number | null | undefined;
  radius: number;
  enable?: boolean;
  pollMs?: number;
}
