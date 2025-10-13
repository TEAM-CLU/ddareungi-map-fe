import { SERVER_URL } from '@/shared/model/index.constants';
import axios from 'axios';
import {
  FullJourneyPayload,
  FullJourneyResponse,
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
): Promise<FullJourneyResponse> => {
  const response = await routingApi.post<FullJourneyResponse>(
    '/full-journey',
    payload,
  );
  return response.data;
};
