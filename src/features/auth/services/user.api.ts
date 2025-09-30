import {
  CheckEmailPayload,
  CheckEmailResponse,
  CreateUserPayload,
  CreateUserResponse,
  LoginUserPayload,
  LoginUserResponse,
} from '@/features/auth/model/auth.types';
import { SERVER_URL } from '@/shared/model/index.constants';
import axios from 'axios';

// default instance
const userApi = axios.create({
  baseURL: `${SERVER_URL}/user`,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 유저 회원가입
export const postCreateUser = async (
  payload: CreateUserPayload,
): Promise<CreateUserResponse> => {
  const response = await userApi.post('/create-user', payload);
  return response.data;
};

// 유저 로그인
export const postLoginUser = async (
  payload: LoginUserPayload,
): Promise<LoginUserResponse> => {
  const response = await userApi.post('/login-user', payload);
  return response.data;
};

// 내 정보 조회
// 내 정보 수정
// 비밀번호 변경
// 마이페이지 정보 조회

// 이메일 중복 확인
export const postCheckEmail = async (
  payload: CheckEmailPayload,
): Promise<CheckEmailResponse> => {
  const response = await userApi.post('/check-email', payload);
  return response.data;
};
