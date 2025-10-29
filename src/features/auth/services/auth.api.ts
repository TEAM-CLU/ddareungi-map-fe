import {
  LogoutResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  SendVerificationEmailPayload,
  SendVerificationEmailResponse,
  SocialAuthResponse,
  SocialAuthType,
  VerifyEmailPayload,
  VerifyEmailResponse,
} from '@/features/auth/model/auth.types';
import { SERVER_URL } from '@/shared/model/index.constants';
import axios from 'axios';

// default instance ip주소로변경
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

// // 소셜 회원가입/로그인 PKCE
// export const getSocialAuthPkce = async (
//   socialAuthType: SocialAuthType,
// ): Promise<SocialAuthPkceResponse> => {
//   const response = await authApi.get(`/${socialAuthType}/pkce`);
//   return response.data;
// };

// // 소셜 회원가입/로그인 exchange token
// export const postSocialAuthExchangeToken = async (
//   payload: SocialAuthExchangeTokenPayload,
// ): Promise<SocialAuthExchangeTokenResponse> => {
//   const response = await authApi.post(`/exchange-token`, payload);
//   return response.data;
// };

//  소셜 회원가입/로그인
export const getSocialAuth = async (
  socialAuthType: SocialAuthType,
): Promise<SocialAuthResponse> => {
  const response = await authApi.get(`/${socialAuthType}`);
  return response.data;
};

// 비밀번호 재설정(비밀번호 찾기)
export const postResetPassword = async (
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> => {
  const response = await authApi.post('/reset-password', payload);
  return response.data;
};

// 로그아웃
export const postLogout = async (): Promise<LogoutResponse> => {
  const response = await authApi.post('/logout', {}, { withCredentials: true });
  return response.data;
};
