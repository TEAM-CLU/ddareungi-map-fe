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
import { ACCESS_TOKEN_KEY, SERVER_URL } from '@/shared/model/index.constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';

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
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    console.log('[getUserInfo] 토큰:', token);

    const response = await userApi.get('/mypage', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('[getUserInfo] 전체 응답:', response);
    console.log(
      '[getUserInfo] response.data:',
      JSON.stringify(response.data, null, 2),
    );
    console.log('[getUserInfo] response.data.data:', response.data.data);

    // 서버 응답이 { data: { ...유저정보 } } 형태인 경우
    if (response.data.data) {
      console.log('[getUserInfo] data.data 반환');
      return response.data.data;
    }

    // 서버 응답이 바로 { ...유저정보 } 형태인 경우
    console.log('[getUserInfo] data 직접 반환');
    return response.data;
  } catch (error: any) {
    console.error('[getUserInfo] 에러 발생:', error);
    console.error('[getUserInfo] 에러 응답:', error.response?.data);
    Alert.alert(
      '유저 정보 조회 실패',
      error.response?.data?.message || error.message || '알 수 없는 오류',
    );
    throw error;
  }
};

// 유저 정보 수정
export const updateUserInfo = async (
  payload: UpdateUserPayload,
): Promise<UpdateUserResponse> => {
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    console.log('[updateUserInfo] 토큰:', token);
    console.log('[updateUserInfo] payload:', JSON.stringify(payload, null, 2));

    const response = await userApi.put('/info-update', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('[updateUserInfo] 성공 응답:', response);
    console.log(
      '[updateUserInfo] response.data:',
      JSON.stringify(response.data, null, 2),
    );

    // 서버 응답이 { data: { ...결과 } } 형태인 경우
    if (response.data.data) {
      console.log('[updateUserInfo] data.data 반환');
      return response.data.data;
    }

    // 서버 응답이 바로 { ...결과 } 형태인 경우
    console.log('[updateUserInfo] data 직접 반환');
    return response.data;
  } catch (error: any) {
    console.error('[updateUserInfo] 에러 발생:', error);
    console.error('[updateUserInfo] 에러 응답:', error.response?.data);
    console.error('[updateUserInfo] 에러 상태코드:', error.response?.status);
    Alert.alert(
      '유저 정보 수정 실패',
      error.response?.data?.message || error.message || '알 수 없는 오류',
    );
    throw error;
  }
};

// 유저 삭제
export const deleteUser = async (): Promise<DeleteUserResponse> => {
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  const response = await userApi.delete('/withdraw', {
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
