import {
  PkceCallbackParams,
  ResetPasswordPayload,
  SendVerificationEmailPayload,
  SocialAuthPkceCallbackPayload,
  SocialAuthType,
  VerifyEmailPayload,
} from '@/features/auth/model/auth.types';
import {
  getSocialAuthPkce,
  getSocialAuthPkceCallback,
  postResetPassword,
  postSendVerificationEmail,
  postVerifyEmail,
} from '@/features/auth/services/auth.api';
import { useMutation } from '@tanstack/react-query';

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

// 소셜 회원가입/로그인 PKCE-> get이지만 토큰 취득이란 행위에 포커싱, mutation으로 지정 / useQuery는 바로 자동요청 되므로...
export const useSocialAuthPkceMutation = () => {
  const mutation = useMutation({
    mutationFn: (socialType: SocialAuthType) => getSocialAuthPkce(socialType),
  });

  return mutation;
};

// 소셜 회원가입/로그인 PKCE callback
export const useSocialAuthPkceCallbackMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: SocialAuthPkceCallbackPayload) =>
      getSocialAuthPkceCallback(payload.socialAuthType, payload.params),
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
