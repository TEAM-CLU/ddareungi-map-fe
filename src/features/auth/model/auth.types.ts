/********** 인증 **********/

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
  verficationCode: number;
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
export interface SocialAuthPayload {
  socialType: 'naver' | 'kakao' | 'google';
}
export interface SocialAuthResponse {
  accessToken: string;
}

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
}

interface LoginUserResponseFailed {
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
  isAvailable: boolean;
  message: string;
}

interface CheckEmailResponseFailed {
  statusCode: number;
  message: string;
}
