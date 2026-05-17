import {
  CircularJourneyPayload,
  FullJourneyPayload,
  RouteResponse,
} from '../model/routing.types';
import { api } from '@/shared/services/axios';

// 통합 경로 검색
export const postFullJourney = async (
  payload: FullJourneyPayload,
): Promise<RouteResponse> => {
  const response = await api.post<RouteResponse>(
    '/routes/full-journey',
    payload,
    { timeout: 100000 },
  );
  return response.data;
};

// 원형 경로 검색
export const postCircularJourney = async (
  payload: CircularJourneyPayload,
): Promise<RouteResponse> => {
  const response = await api.post<RouteResponse>(
    '/routes/circular-journey',
    payload,
    { timeout: 100000 },
  );
  return response.data;
};
