import {
  KeepNavigationSessionAlivePayload,
  KeepNavigationSessionAliveResponse,
  ReRoutePayload,
  ReRouteResponse,
  ReturnToExistingRoutePayload,
  ReturnToExistingRouteResponse,
  StartNavigationSessionPayload,
  StartNavigationSessionResponse,
  TerminateNavigationSessionPayload,
  TerminateNavigationSessionResponse,
} from '@/features/navigation/model/navigation.types';
import { api } from '@/shared/services/axios';

// 내비게이션 세션 시작
export const postStartNavigationSession = async (
  payload: StartNavigationSessionPayload,
): Promise<StartNavigationSessionResponse> => {
  const response = await api.post('/navigation/start', payload);
  return response.data;
};

// 내비게이션 세션 유지, 갱신 10분
export const postKeepNavigationSessionAlive = async (
  payload: KeepNavigationSessionAlivePayload,
): Promise<KeepNavigationSessionAliveResponse> => {
  const response = await api.post(`/${payload.sessionId}/heartbeat`);
  return response.data;
};

// 내비게이션 세션 종료
export const deleteTerminateNavigationSession = async (
  payload: TerminateNavigationSessionPayload,
): Promise<TerminateNavigationSessionResponse> => {
  const response = await api.delete(`/navigation/${payload.sessionId}`);
  return response.data;
};

// 기존 경로 복귀
export const postReturnToExistingRoute = async (
  payload: ReturnToExistingRoutePayload,
): Promise<ReturnToExistingRouteResponse> => {
  const response = await api.post(`/navigation/${payload.sessionId}/return`, {
    currentLocation: payload.currentLocation,
    remainingWaypoints: payload.remainingWaypoints,
  });

  return response.data;
};

// 완전 재탐색
export const postReRoute = async (
  payload: ReRoutePayload,
): Promise<ReRouteResponse> => {
  const response = await api.post(`/navigation/${payload.sessionId}/reroute`, {
    currentLocation: payload.currentLocation,
    travelMode: payload.travelMode,
    remainingWaypoints: payload.remainingWaypoints,
  });
  return response.data;
};
