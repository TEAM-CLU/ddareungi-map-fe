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

export type AccountFeatureType = 'findAccount' | 'resetPwd' | null;
