import {
  ResetPasswordPayload,
  SendVerificationEmailPayload,
  SocialAuthPayload,
  VerifyEmailPayload,
} from '@/features/auth/model/auth.types';
import {
  getSocialAuth,
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

// 소셜 회원가입/로그인 -> get이지만 토큰 취득이란 행위에 포커싱, mutation으로 지정
export const useSocialAuthMutation = () => {
  const mutation = useMutation({
    mutationFn: (socialType: SocialAuthPayload) => getSocialAuth(socialType),
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
