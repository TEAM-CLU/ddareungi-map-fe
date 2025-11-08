import {
  GetStationLatestBikeCountListPayload,
  MapAreaStationData,
  MapAreaStationListPayload,
  NearbyStationListPayload,
  NearbyStationData,
  StationLatestBikeCountData,
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
export const getNearbyStationList = async (
  payload: NearbyStationListPayload,
): Promise<NearbyStationData[]> => {
  const response = await stationApi.get('/nearby', {
    params: payload,
  });
  return response.data.data ?? [];
};

// 지도 특정 영역 내 대여소 조회
export const getMapAreaStationList = async (
  payload: MapAreaStationListPayload,
  signal?: AbortSignal,
): Promise<MapAreaStationData[]> => {
  const response = await stationApi.get('/map-area', {
    params: payload,
    signal,
  });
  return response.data.data ?? [];
};

// 대여소 재고 정보 조회
export const postStationLatestBikeCountList = async (
  payload: GetStationLatestBikeCountListPayload,
  signal?: AbortSignal,
): Promise<StationLatestBikeCountData[]> => {
  const response = await stationApi.post('/realtime-sync/batch', payload, {
    signal,
  });
  return response.data.data ?? [];
};
