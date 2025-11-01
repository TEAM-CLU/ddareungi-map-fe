import { SERVER_URL } from '@/shared/model/index.constants';
import axios from 'axios';
import {
  CircularJourneyPayload,
  FullJourneyPayload,
  RouteResponse,
} from '../model/routing.types';

// default instance ip주소로변경
const routingApi = axios.create({
  baseURL: `${SERVER_URL}/routes`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 통합 경로 검색
export const postFullJourney = async (
  payload: FullJourneyPayload,
): Promise<RouteResponse> => {
  try {
    const response = await routingApi.post<RouteResponse>(
      '/full-journey',
      payload,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`경로 검색 실패: ${message}`);
    }
    throw error;
  }
};

// 원형 경로 검색
export const postCircularJourney = async (
  payload: CircularJourneyPayload,
): Promise<RouteResponse> => {
  try {
    const response = await routingApi.post<RouteResponse>(
      '/circular-journey',
      payload,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`원형 경로 검색 실패: ${message}`);
    }
    throw error;
  }
};
