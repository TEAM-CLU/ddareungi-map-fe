import {
  ResetPasswordPayload,
  SendVerificationEmailPayload,
  SocialAuthCheckStatusQueryPayload,
  SocialAuthCheckStatusResponse,
  SocialAuthExchangeTokenPayload,
  SocialType,
  VerifyEmailPayload,
} from '@/features/auth/model/auth.types';
import {
  getSocialAuthCheckStatus,
  getSocialAuthUrl,
  postResetPassword,
  postSendVerificationEmail,
  postSocialAuthExchangeToken,
  postVerifyEmail,
} from '@/features/auth/services/auth.api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert } from 'react-native';

// 이메일 인증 코드 발송
export const useSendVerificationEmailMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: SendVerificationEmailPayload) =>
      postSendVerificationEmail(payload),
  });

  return mutation;
};

// 이메일 인증 코드 확인
export const useVerifyEmailMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: VerifyEmailPayload) => postVerifyEmail(payload),
  });

  return mutation;
};

// 비밀번호 재설정(비밀번호 찾기)
export const useResetPasswordMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: ResetPasswordPayload) => postResetPassword(payload),
  });

  return mutation;
};

// 소셜 회원가입/로그인 auth url 요청 - 사용자가 버튼을 눌렀을때만 작동하도록 mutaation으로 구현
export const useSocialAuthGetUrlMutation = () => {
  const mutation = useMutation({
    mutationFn: (socialType: SocialType) => getSocialAuthUrl(socialType),
  });

  return mutation;
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
      const data = query.state.data as
        | SocialAuthCheckStatusResponse
        | null
        | undefined;
      if (!data) return payload.pollMs ?? 3000;
      return data.isComplete ? false : data.recommendedPollingInterval ?? 3000;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always',
  });
};

// 소셜 회원가입/로그인 토큰 교환
export const useSocialAuthExchangeTokenMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: SocialAuthExchangeTokenPayload) =>
      postSocialAuthExchangeToken(payload),
  });

  return mutation;
};
