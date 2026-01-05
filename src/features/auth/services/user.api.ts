import {
  CheckEmailPayload,
  CheckEmailResponse,
  CreateUserPayload,
  CreateUserResponse,
  DeleteUserResponse,
  GetUserInfoResponse,
  LoginUserPayload,
  LoginUserResponse,
  UpdateUserPayload,
  UpdateUserResponse,
} from '@/features/auth/model/auth.types';
import { api } from '@/shared/services/axios';
import { Alert } from 'react-native';

// 유저 회원가입
export const postCreateUser = async (
  payload: CreateUserPayload,
): Promise<CreateUserResponse> => {
  const response = await api.post('/user/create-user', payload);
  return response.data;
};

// 유저 로그인
export const postLoginUser = async (
  payload: LoginUserPayload,
): Promise<LoginUserResponse> => {
  const response = await api.post('/user/login-user', payload);
  return response.data;
};

// 유저 정보 조회
export const getUserInfo = async (): Promise<GetUserInfoResponse> => {
  const response = await api.get('/user/mypage');
  return response.data;
};

// 유저 정보 수정
export const updateUserInfo = async (
  payload: UpdateUserPayload,
): Promise<UpdateUserResponse> => {
    const response = await api.put('/user/info-update', payload);
    return response.data;
};

// 유저 삭제
export const deleteUser = async (): Promise<DeleteUserResponse> => {
  const response = await api.delete('/user/withdraw');
  return response.data;
};

// 이메일 중복 확인
export const postCheckEmail = async (
  payload: CheckEmailPayload,
): Promise<CheckEmailResponse> => {
  const response = await api.post('/user/check-email', payload);
  return response.data;
};
