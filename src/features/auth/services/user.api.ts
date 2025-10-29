import {
  CheckEmailPayload,
  CheckEmailResponse,
  CreateUserPayload,
  CreateUserResponse,
  GetUserInfoResponse,
  LoginUserPayload,
  LoginUserResponse,
  UpdateUserPayload,
  UpdateUserResponse,
} from '@/features/auth/model/auth.types';
import { SERVER_URL } from '@/shared/model/index.constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// 유저 정보 조회
export const getUserInfo = async (): Promise<GetUserInfoResponse> => {
  const token = await AsyncStorage.getItem('ACCESS_TOKEN_KEY');
  const response = await userApi.get('/info', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 유저 정보 수정
export const updateUserInfo = async (
  payload: UpdateUserPayload,
): Promise<UpdateUserResponse> => {
  const token = await AsyncStorage.getItem('ACCESS_TOKEN_KEY');
  const response = await userApi.put('/info-update', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 비밀번호 변경

// 이메일 중복 확인
export const postCheckEmail = async (
  payload: CheckEmailPayload,
): Promise<CheckEmailResponse> => {
  const response = await userApi.post('/check-email', payload);
  return response.data;
};
