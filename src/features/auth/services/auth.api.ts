import {
  ResetPasswordPayload,
  ResetPasswordResponse,
  SendVerificationEmailPayload,
  SendVerificationEmailResponse,
  SocialAuthCheckStatusPayload,
  SocialAuthCheckStatusResponse,
  SocialAuthExchangeTokenPayload,
  SocialAuthExchangeTokenResponse,
  SocialAuthGetUrlResponse,
  SocialType,
  VerifyEmailPayload,
  VerifyEmailResponse,
} from '@/features/auth/model/auth.types';
import { SERVER_URL } from '@/shared/model/index.constants';
import axios from 'axios';

// default instance ip주소로변경
const authApi = axios.create({
  baseURL: `${SERVER_URL}/auth`,
  timeout: 10000,
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

// 비밀번호 재설정(비밀번호 찾기)
export const postResetPassword = async (
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> => {
  const response = await authApi.post('/reset-password', payload);
  return response.data;
};

// 소셜 회원가입/로그인 auth url 요청
export const getSocialAuthUrl = async (
  socialType: SocialType,
): Promise<SocialAuthGetUrlResponse> => {
  const response = await authApi.get(`/${socialType}/pkce`);
  return response.data;
};

// 소셜 회원가입/로그인 상태 확인
export const getSocialAuthCheckStatus = async (
  payload: SocialAuthCheckStatusPayload,
  signal?: AbortSignal,
): Promise<SocialAuthCheckStatusResponse> => {
  const response = await authApi.get('/check-status', {
    params: payload,
    signal,
  });
  return response.data;
};

// 소셜 회원가입/로그인 토큰 교환
export const postSocialAuthExchangeToken = async (
  payload: SocialAuthExchangeTokenPayload,
): Promise<SocialAuthExchangeTokenResponse> => {
  const response = await authApi.post('/exchange-token', payload);
  return response.data;
};
