import {
  keepNavigationSessionAlivePayload,
  keepNavigationSessionAliveResponse,
  ReRoutePayload,
  ReRouteResponse,
  ReturnToExistingRoutePayload,
  ReturnToExistingRouteResponse,
  StartNavigationSessionPayload,
  StartNavigationSessionResponse,
  TerminateNavigationSessionPayload,
  TerminateNavigationSessionResponse,
} from '@/features/navigation/model/navigation.types';
import { SERVER_URL } from '@/shared/model/index.constants';
import axios from 'axios';

const navigationApi = axios.create({
  baseURL: `${SERVER_URL}/navigation`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 내비게이션 세션 시작
export const postStartNavigationSession = async (
  payload: StartNavigationSessionPayload,
): Promise<StartNavigationSessionResponse> => {
  const response = await navigationApi.post('/start', payload);
  return response.data;
};

// 내비게이션 세션 유지, 갱신 10분
export const postKeepNavigationSessionAlive = async (
  payload: keepNavigationSessionAlivePayload,
): Promise<keepNavigationSessionAliveResponse> => {
  const response = await navigationApi.post(`/${payload.sessionId}/heartbeat`);
  return response.data;
};

// 내비게이션 세션 종료
export const deleteTerminateNavigationSession = async (
  payload: TerminateNavigationSessionPayload,
): Promise<TerminateNavigationSessionResponse> => {
  const response = await navigationApi.delete(`/${payload.sessionId}`);
  return response.data;
};

// 기존 경로 복귀
export const postReturnToExistingRoute = async (
  payload: ReturnToExistingRoutePayload,
): Promise<ReturnToExistingRouteResponse> => {
  const response = await navigationApi.post(`/${payload.sessionId}/return`, {
    currentLocation: payload.currentLocation,
    remainingWaypoints: payload.remainingWaypoints,
  });

  return response.data;
};

// 완전 재탐색
export const postReRoute = async (
  payload: ReRoutePayload,
): Promise<ReRouteResponse> => {
  const response = await navigationApi.post(`/${payload.sessionId}/reroute`, {
    currentLocation: payload.currentLocation,
    travelMode: payload.travelMode,
    remainingWaypoints: payload.remainingWaypoints,
  });
  return response.data;
};
