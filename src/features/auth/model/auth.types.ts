/********** 인증 **********/

import { Permission, PermissionStatus } from 'react-native-permissions';

// 이메일 인증 코드 발송
export interface SendVerificationEmailPayload {
  email: string;
}

export interface SendVerificationEmailResponse {
  statusCode: number;
  message: string;
  data: null;
}

// 이메일 인증 코드 확인
export interface VerifyEmailPayload {
  email: string;
  verificationCode: string;
}

export interface VerifyEmailResponse {
  statusCode: number;
  message: string;
  data: {
    isVerified: boolean;
    securityToken: string;
  };
}

// 계정 찾기
export interface FindAccountPayload {
  securityToken: string;
}

export interface FindAccountResponse {
  statusCode: number;
  message: string;
  data: {
    isRegistered: boolean;
    accountType: '소셜' | '자체';
  };
}

// 소셜 회원가입/로그인
export type SocialType = 'naver' | 'kakao' | 'google';

export interface SocialAuthGetUrlResponse {
  status: number;
  message: string;
  data: {
    authUrl: string;
    codeVerifier: string;
    state: string;
  };
}

export interface SocialAuthCheckStatusPayload {
  clientState: string;
}
export interface SocialAuthCheckStatusResponse {
  status: number;
  message: string;
  data: {
    state: string | null;
    isComplete: boolean;
    recommendedPollingInterval: number;
  };
}

export interface SocialAuthExchangeTokenPayload {
  codeVerifier: string;
}

export interface SocialAuthExchangeTokenResponse {
  status: number;
  message: string;
  data: {
    accessToken: string;
  };
}

export interface SocialAuthCheckStatusQueryPayload {
  pollMs: number;
  canRun: boolean;
  payloadForApi: SocialAuthCheckStatusPayload;
}
// 비밀번호 재설정(비밀번호 찾기)
export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
}
export interface ResetPasswordResponse {
  status: number;
  message: string;
  data: null;
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
  address: string | null;
  consentedAt: string;
  requiredAgreed: boolean;
  optionalAgreed: boolean;
}

export interface CreateUserResponse {
  statusCode: number;
  message: string;
  data: null;
}

// 유저 로그인
export interface LoginUserPayload {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
  };
}

// 유저 정보 조회
export interface GetUserInfoResponse {
  message: string;
  data: UserInfo;
}

export interface UserInfo {
  name: string;
  email: string;
  birthDate: string;
  gender: 'M' | 'F';
  address: string | null;
  totalTime: number;
  totalDistance: number;
  calories: number;
  carbonReduction: number;
  treesPlanted: number;
  consentedAt: string;
  requiredAgreed: boolean;
  optionalAgreed: boolean;
}

// 유저 정보 수정
export interface UpdateUserPayload {
  name: string;
  birthDate: string;
  gender: 'M' | 'F';
  address: string | null;
  consentedAt: string;
  requiredAgreed: boolean;
  optionalAgreed: boolean;
}

export interface UpdateUserResponse {
  message: string;
  data: UpdateUserPayload;
}

// 유저 삭제
export interface DeleteUserResponse {
  message: string;
}

// 이메일 중복 확인
export interface CheckEmailPayload {
  email: string;
}

export interface CheckEmailResponse {
  statusCode: number;
  message: string;
  data: null;
}

// 유저 통계 업데이트

interface StatsInfo {
  totalDistance: number;
  totalTime: number;
  calories: number;
  plantingTree: number;
  carbonReduction: number;
}
export interface UpdateUserStatsPayload {
  statsInfo: StatsInfo;
}

export interface UpdateUserStatsResponse {
  statusCode: number;
  message: string;
  data: StatsInfo;
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
