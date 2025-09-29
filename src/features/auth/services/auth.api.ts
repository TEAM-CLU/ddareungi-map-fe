import {
  ResetPasswordPayload,
  ResetPasswordResponse,
  SendVerificationEmailPayload,
  SendVerificationEmailResponse,
  SocialAuthPayload,
  SocialAuthResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
} from '@/features/auth/model/auth.types';
import { SERVER_URL } from '@/shared/model/index.constants';
import axios from 'axios';

// default instance
const authApi = axios.create({
  baseURL: `${SERVER_URL}/auth`,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 이메일 인증 코드 발송
export const postSendVerificationEmail = async (
  payload: SendVerificationEmailPayload,
): Promise<SendVerificationEmailResponse> => {
  const response = await authApi.post('/send-verification-email', payload);
  return response.data;
};

// 이메일 인증 코드 확인
export const postVerifyEmail = async (
  payload: VerifyEmailPayload,
): Promise<VerifyEmailResponse> => {
  const response = await authApi.post('/verify-email', payload);
  return response.data;
};

// 소셜 회원가입/로그인
export const getSocialAuth = async (
  socialType: SocialAuthPayload,
): Promise<SocialAuthResponse> => {
  const response = await authApi.get(`/${socialType}`);
  return response.data;
};

// 비밀번호 재설정(비밀번호 찾기)
export const postResetPassword = async (
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> => {
  const response = await authApi.post('/reset-password', payload);
  return response.data;
};
