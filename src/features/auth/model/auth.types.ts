/********** 인증 **********/

import { Permission, PermissionStatus } from 'react-native-permissions';

// 이메일 인증 코드 발송
export interface SendVerificationEmailPayload {
  email: string;
}

export type SendVerificationEmailResponse =
  | SendVerificationEmailResponseSuccess
  | SendVerificationEmailResponseFailed;

interface SendVerificationEmailResponseSuccess {
  message: string;
}

interface SendVerificationEmailResponseFailed {
  statusCode: number;
  message: string;
}

// 이메일 인증 코드 확인
export interface VerifyEmailPayload {
  email: string;
  verificationCode: string;
}

export type VerifyEmailResponse =
  | VerifyEmailResponseSuccess
  | VerifyEmailResponseFailed;
interface VerifyEmailResponseSuccess {
  message: string;
  isVerified: boolean;
}

interface VerifyEmailResponseFailed {
  statusCode: number;
  message: string;
}

// 소셜 회원가입/로그인
export type SocialAuthType = 'naver' | 'kakao' | 'google';

export type SocialAuthResponse =
  | SocialAuthResponseSuccess
  | SocialAuthResponseFailed;
export interface SocialAuthResponseSuccess {
  accessToken: string;
}

export interface SocialAuthResponseFailed {
  statusCode: number;
  message: string;
}

// export interface SocialAuthPkceResponse {
//   message: string;
//   authUrl: string;
//   codeVerifier: string;
//   state: string;
// }

// export interface SocialAuthExchangeTokenPayload {
//   codeVerifier: string;
//   state: string;
// }

// export type SocialAuthExchangeTokenResponse =
//   | SocialAuthExchangeTokenResponseSuccess
//   | SocialAuthExchangeTokenResponseFailed;

// interface SocialAuthExchangeTokenResponseSuccess {
//   accessToken: string;
//   message: string;
// }

// interface SocialAuthExchangeTokenResponseFailed {
//   statusCode: number;
//   message: string;
// }

// 비밀번호 재설정(비밀번호 찾기)
export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
}
export type ResetPasswordResponse =
  | ResetPasswordResponseSuccess
  | ResetPasswordResponseFailed;
interface ResetPasswordResponseSuccess {
  message: string;
}

interface ResetPasswordResponseFailed {
  statusCode: number;
  message: string;
}

// 로그아웃
export interface LogoutResponse {
  message: string;
}

/********** 유저 **********/

// 유저 회원가입
export interface CreateUserPayload {
  socialUid: string | null; // null: 일반회원가입
  email: string;
  password: string;
  name: string;
  gender: 'M' | 'F';
  birthDate: string;
  address: string;
}

export type CreateUserResponse =
  | CreateUserResponseSuccess
  | CreateUserResponseFailed;
interface CreateUserResponseSuccess {
  message: string;
}

interface CreateUserResponseFailed {
  statusCode: number;
  message: string;
}

// 유저 로그인
export interface LoginUserPayload {
  email: string;
  password: string;
}

export type LoginUserResponse =
  | LoginUserResponseSuccess
  | LoginUserResponseFailed;

interface LoginUserResponseSuccess {
  message: string;
  accessToken: string;
}

interface LoginUserResponseFailed {
  statusCode: number;
  message: string;
}

// 유저 정보 조회
export interface GetUserInfoResponseSuccess {
  name: string;
  email: string;
  birthDate: string;
  gender: 'M' | 'F';
  address: string;
  totalTime: number;
  totalDistance: number;
  calories: number;
  carbonReduction: number;
  treesPlanted: number;
}

export interface GetUserInfoResponseFailed {
  statusCode: number;
  message: string;
}

export type GetUserInfoResponse =
  | GetUserInfoResponseSuccess
  | GetUserInfoResponseFailed;

// 유저 정보 수정
export interface UpdateUserPayload {
  name: string;
  birthDate: string;
  gender: 'M' | 'F';
  address: string;
}

export type UpdateUserResponse =
  | UpdateUserResponseSuccess
  | UpdateUserResponseFailed;

interface UpdateUserResponseSuccess {
  name: string;
  birthDate: string;
  gender: 'M' | 'F';
  address: string;
}

interface UpdateUserResponseFailed {
  statusCode: number;
  message: string;
}

// 이메일 중복 확인
export interface CheckEmailPayload {
  email: string;
}

export type CheckEmailResponse =
  | CheckEmailResponseSuccess
  | CheckEmailResponseFailed;

interface CheckEmailResponseSuccess {
  message: string;
}

interface CheckEmailResponseFailed {
  statusCode: number;
  message: string;
}

// 권한 타입
export interface PermissionItem {
  name: string;
  permission: Permission | 'NOTIFICATIONS';
  required: boolean;
  status: PermissionStatus;
  icon: React.ReactNode;
  description: string;
}
