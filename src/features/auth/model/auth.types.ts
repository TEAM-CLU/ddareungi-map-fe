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
  messae: string;
  error: string;
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
  error: string;
}

// 소셜 회원가입/로그인
export interface SocialAuthPayload {
  socialType: 'naver' | 'kakao' | 'google';
}
export interface SocialAuthResponse {
  token: string; // 변경 예정
}

// 비밀번호 재설정(비밀번호 찾기)
export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
}
export type ResetPasswordRespose =
  | ResetPasswordResponseSuccess
  | ResetPasswordResponseFailed;
interface ResetPasswordResponseSuccess {
  message: string;
}

interface ResetPasswordResponseFailed {
  statusCode: number;
  message: string;
  error: string;
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
  phoneNumber: string; // 삭제예정
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
  error: string;
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
  error: string;
}
