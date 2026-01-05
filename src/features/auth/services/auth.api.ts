import {
  LogoutResponse,
  FindAccountPayload,
  FindAccountResponse,
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
import { api } from '@/shared/services/axios';
import axios from 'axios';

// 이메일 인증 코드 발송
export const postSendVerificationEmail = async (
  payload: SendVerificationEmailPayload,
): Promise<SendVerificationEmailResponse> => {
  const response = await api.post('/auth/send-verification-email', payload);
  return response.data;
};

// 이메일 인증 코드 확인
export const postVerifyEmail = async (
  payload: VerifyEmailPayload,
): Promise<VerifyEmailResponse> => {
  const response = await api.post('/auth/verify-email', payload);
  return response.data;
};

// 계정 찾기
export const postFindAccount = async (
  payload: FindAccountPayload,
): Promise<FindAccountResponse> => {
  const response = await api.post('/auth/find-account', payload);
  return response.data;
};

// 비밀번호 재설정(비밀번호 찾기)
export const postResetPassword = async (
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> => {
  const response = await api.post('/auth/reset-password', payload);
  return response.data;
};

// 소셜 회원가입/로그인 auth url 요청
export const getSocialAuthUrl = async (
  socialType: SocialType,
): Promise<SocialAuthGetUrlResponse> => {
  const response = await api.get(`/auth/${socialType}/pkce`);
  return response.data;
};

// 소셜 회원가입/로그인 상태 확인
export const getSocialAuthCheckStatus = async (
  payload: SocialAuthCheckStatusPayload,
  signal?: AbortSignal,
): Promise<SocialAuthCheckStatusResponse> => {
  const response = await api.get('/auth/check-status', {
    params: payload,
    signal,
  });
  return response.data;
};

// 소셜 회원가입/로그인 토큰 교환
export const postSocialAuthExchangeToken = async (
  payload: SocialAuthExchangeTokenPayload,
): Promise<SocialAuthExchangeTokenResponse> => {
  const response = await api.post('/auth/exchange-token', payload);
  return response.data;
};

// 로그아웃
export const postLogout = async (): Promise<LogoutResponse> => {
  const response = await api.post('/auth/logout', {}, { withCredentials: true });
  return response.data;
};
