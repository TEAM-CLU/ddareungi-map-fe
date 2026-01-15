import {
  SocialAuthCheckStatusQueryPayload,
  SocialAuthCheckStatusResponse,
} from '@/features/auth/model/auth.types';
import {
  postLogout,
  getSocialAuthCheckStatus,
  getSocialAuthUrl,
  postFindAccount,
  postResetPassword,
  postSendVerificationEmail,
  postSocialAuthExchangeToken,
  postVerifyEmail,
} from '@/features/auth/services/auth.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/providers';

// 이메일 인증 코드 발송
export const useSendVerificationEmailMutation = () => {
  return useMutation({
    mutationFn: postSendVerificationEmail,
  });
};

// 이메일 인증 코드 확인
export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: postVerifyEmail,
  });
};

// 계정 찾기
export const useFindAccountMutation = () => {
  return useMutation({
    mutationFn: postFindAccount,
  });
};

// 비밀번호 재설정 (비밀번호 찾기)
export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: postResetPassword,
  });
};

// 로그아웃
export const useLogoutMutation = () => {
  const { removeToken } = useAuth();

  return useMutation({
    mutationFn: postLogout,
    onSettled: async () => {
      await removeToken(); // 앱 내 토큰 삭제
    },
  });
};

// 소셜 회원가입/로그인 auth url 요청 - 사용자가 버튼을 눌렀을때만 작동하도록 mutation으로 구현
export const useSocialAuthGetUrlMutation = () => {
  return useMutation({
    mutationFn: getSocialAuthUrl,
  });
};

// 소셜 회원가입/로그인 상태 확인
export const useSocialAuthCheckStatusQuery = (
  payload: SocialAuthCheckStatusQueryPayload,
) => {
  return useQuery({
    queryKey: [
      'auth',
      'check-status',
      payload.payloadForApi.clientState,
    ] as const,
    queryFn: async ({ signal }) => {
      if (!!payload.canRun && payload.payloadForApi) {
        const response = await getSocialAuthCheckStatus(
          payload.payloadForApi,
          signal,
        );
        return response;
      }
      return null;
    },
    enabled: payload.canRun,
    staleTime: 0,
    gcTime: 2 * 60 * 1000,
    refetchInterval: query => {
      const queryData = query.state.data as
        | SocialAuthCheckStatusResponse
        | null
        | undefined;
      if (!queryData) return payload.pollMs ?? 3000;
      return queryData.data.isComplete
        ? false
        : queryData.data.recommendedPollingInterval ?? 3000;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always',
  });
};

// 소셜 회원가입/로그인 토큰 교환
export const useSocialAuthExchangeTokenMutation = () => {
  return useMutation({
    mutationFn: postSocialAuthExchangeToken,
  });
};
