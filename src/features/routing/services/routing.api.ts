import { SERVER_URL } from '@/shared/model/index.constants';
import axios from 'axios';
import {
  CircularJourneyPayload,
  FullJourneyPayload,
  RouteResponse,
} from '../model/routing.types';
import { Alert } from 'react-native';
import { api } from '@/shared/services/axios';

// 통합 경로 검색
export const postFullJourney = async (
  payload: FullJourneyPayload,
): Promise<RouteResponse> => {
  try {
    const response = await api.post<RouteResponse>(
      '/routes/full-journey',
      payload,
      { timeout: 100000 },
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
    const response = await api.post<RouteResponse>(
      '/routes/circular-journey',
      payload,
      { timeout: 100000 },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      Alert.alert('원형 경로 검색 실패', message, error.response?.data);
      throw new Error(`원형 경로 검색 실패: ${message}`);
    }
    throw error;
  }
};
