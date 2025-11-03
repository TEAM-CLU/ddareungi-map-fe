import {
  GetStationsLatestBikeCountPayload,
  MapAreaStationsData,
  MapAreaStationsPayload,
  NearbyStationsData,
  NearbyStationsPayload,
  StationsLatestBikeCountData,
} from '@/features/station/model/station.types';
import { SERVER_URL } from '@/shared/model/index.constants';
import axios from 'axios';

const stationApi = axios.create({
  baseURL: `${SERVER_URL}/stations`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 가장 가까운 대여소 3개 조회
export const getNearbyStations = async (
  payload: NearbyStationsPayload,
): Promise<NearbyStationsData[]> => {
  const response = await stationApi.get('/nearby', {
    params: payload,
  });
  return response.data.data ?? [];
};

// 지도 특정 영역 내 대여소 조회
export const getMapAreaStations = async (
  payload: MapAreaStationsPayload,
  signal?: AbortSignal,
): Promise<MapAreaStationsData[]> => {
  const response = await stationApi.get('/map-area', {
    params: payload,
    signal,
  });
  return response.data.data ?? [];
};

// 대여소 재고 정보 조회
export const postStationsLatestBikeCount = async (
  payload: GetStationsLatestBikeCountPayload,
  signal?: AbortSignal,
): Promise<StationsLatestBikeCountData[]> => {
  const response = await stationApi.post('/realtime-sync/batch', payload, {
    signal,
  });
  return response.data.data ?? [];
};
