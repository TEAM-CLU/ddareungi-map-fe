/********** 인증 **********/

import { Permission, PermissionStatus } from 'react-native-permissions';

// 이메일 인증 코드 발송
export interface SendVerificationEmailPayload {
  email: string;
}

export interface SendVerificationEmailResponse {
  message: string;
}

// 이메일 인증 코드 확인
export interface VerifyEmailPayload {
  email: string;
  verificationCode: string;
}

export interface VerifyEmailResponse {
  message: string;
  isVerified: boolean;
}

// 소셜 회원가입/로그인
export type SocialType = 'naver' | 'kakao' | 'google';

// 비밀번호 재설정(비밀번호 찾기)
export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
}
export interface ResetPasswordResponse {
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

export interface CreateUserResponse {
  accessToken: string;
  message: string;
}

// 유저 로그인
export interface LoginUserPayload {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  message: string;
  accessToken: string;
}

// 이메일 중복 확인
export interface CheckEmailPayload {
  email: string;
}

export interface CheckEmailResponse {
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
