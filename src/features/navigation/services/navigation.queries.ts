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
  const mutation = useMutation({
    mutationFn: (payload: StartNavigationSessionPayload) =>
      postStartNavigationSession(payload),
  });
  return mutation;
};

// 내비게이션 세션 유지
export const useKeepNavigationSessionAliveMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: keepNavigationSessionAlivePayload) =>
      postKeepNavigationSessionAlive(payload),
  });
  return mutation;
};

// 내비게이션 세션 종료
export const useTerminateNavigationSessionMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: TerminateNavigationSessionPayload) =>
      deleteTerminateNavigationSession(payload),
  });
  return mutation;
};

// 기존 경로 복귀
export const useReturnToExistingRouteMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: ReturnToExistingRoutePayload) =>
      postReturnToExistingRoute(payload),
  });
  return mutation;
};

// 완전 재탐색
export const useReRouteMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: ReRoutePayload) => postReRoute(payload),
  });
  return mutation;
};
