import {
  keepNavigationSessionAlivePayload,
  ReRoutePayload,
  ReturnToExistingRoutePayload,
  StartNavigationSessionPayload,
  TerminateNavigationSessionPayload,
} from '@/features/navigation/model/navigation.types';
import {
  deleteTerminateNavigationSession,
  postKeepNavigationSessionAlive,
  postReRoute,
  postReturnToExistingRoute,
  postStartNavigationSession,
} from '@/features/navigation/services/navigation.api';
import { useMutation } from '@tanstack/react-query';

// 내비게이션 시작
export const useStartNavigationSessionMutation = () => {
  return useMutation({
    mutationFn: (payload: StartNavigationSessionPayload) =>
      postStartNavigationSession(payload),
  });
};

// 내비게이션 세션 유지
export const useKeepNavigationSessionAliveMutation = () => {
  return useMutation({
    mutationFn: (payload: keepNavigationSessionAlivePayload) =>
      postKeepNavigationSessionAlive(payload),
  });
};

// 내비게이션 세션 종료
export const useTerminateNavigationSessionMutation = () => {
  return useMutation({
    mutationFn: (payload: TerminateNavigationSessionPayload) =>
      deleteTerminateNavigationSession(payload),
  });
};

// 기존 경로 복귀
export const useReturnToExistingRouteMutation = () => {
  return useMutation({
    mutationFn: (payload: ReturnToExistingRoutePayload) =>
      postReturnToExistingRoute(payload),
  });
};

// 완전 재탐색
export const useReRouteMutation = () => {
  return useMutation({
    mutationFn: (payload: ReRoutePayload) => postReRoute(payload),
  });
};
