import { Permission, PermissionStatus } from 'react-native-permissions';

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
export interface StatsInfo {
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
