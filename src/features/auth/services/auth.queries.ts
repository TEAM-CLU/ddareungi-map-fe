import {
  ResetPasswordPayload,
  SendVerificationEmailPayload,
  VerifyEmailPayload,
} from '@/features/auth/model/auth.types';
import {
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

// 비밀번호 재설정(비밀번호 찾기)
export const useResetPasswordMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: ResetPasswordPayload) => postResetPassword(payload),
  });

  return mutation;
};
