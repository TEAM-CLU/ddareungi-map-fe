import { SERVER_URL } from '@/shared/model/index.constants';
import axios from 'axios';
import {
  CircularJourneyPayload,
  FullJourneyPayload,
  RouteResponse,
} from '../model/routing.types';
import { Alert } from 'react-native';

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
    Alert.alert(
      '[API] 경로 검색 요청 시작:',
      JSON.stringify({
        url: `${SERVER_URL}/routes/full-journey`,
        payload: JSON.stringify(payload, null, 2),
      }),
    );

    const response = await routingApi.post<RouteResponse>(
      '/full-journey',
      payload,
    );

    Alert.alert(
      '[API] 경로 검색 응답 성공:',
      JSON.stringify({
        status: response.status,
        data: response.data,
      }),
    );

    return response.data;
  } catch (error) {
    Alert.alert(
      '[API] 경로 검색 에러 발생:',
      JSON.stringify({
        error,
        isAxiosError: axios.isAxiosError(error),
      }),
    );

    if (axios.isAxiosError(error)) {
      Alert.alert(
        '[API] Axios 에러 상세:',
        JSON.stringify({
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
            data: error.config?.data,
          },
        }),
      );

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
