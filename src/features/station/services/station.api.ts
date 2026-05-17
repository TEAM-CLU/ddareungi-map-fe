import {
  GetStationLatestBikeCountListPayload,
  MapAreaStationData,
  MapAreaStationListPayload,
  NearbyStationListPayload,
  NearbyStationData,
  StationLatestBikeCountData,
} from '@/features/station/model/station.types';
import { api } from '@/shared/services/axios';

// 가장 가까운 대여소 3개 조회
export const getNearbyStationList = async (
  payload: NearbyStationListPayload,
): Promise<NearbyStationData[]> => {
  const response = await api.get('/stations/nearby', {
    params: payload,
  });
  return response.data.data ?? [];
};

// 지도 특정 영역 내 대여소 조회
export const getMapAreaStationList = async (
  payload: MapAreaStationListPayload,
  signal?: AbortSignal,
): Promise<MapAreaStationData[]> => {
  const response = await api.get('/stations/map-area', {
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
  const response = await api.post('/stations/realtime-sync/batch', payload, {
    signal,
  });
  return response.data.data ?? [];
};
