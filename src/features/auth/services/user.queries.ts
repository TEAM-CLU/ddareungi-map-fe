import { useAuth } from '@/app/providers';
import {
  GetUserInfoResponse,
  UpdateUserPayload,
  UpdateUserResponse,
} from '@/features/auth/model/auth.types';
import {
  deleteUser,
  getUserInfo,
  postCheckEmail,
  postCreateUser,
  postLoginUser,
  updateUserInfo,
} from '@/features/auth/services/user.api';
import { ACCESS_TOKEN_KEY } from '@/shared/model/index.constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// 유저 회원가입
export const useCreateUserMutation = () => {
  return useMutation({
    mutationFn: postCreateUser,
  });
};

// 유저 로그인
export const useLoginUserMutation = () => {
  const { setToken } = useAuth();

  return useMutation({
    mutationFn: postLoginUser,

    // 성공 시: 토큰 저장 + 상태 업데이트
    onSuccess: async data => {
      const accessToken = data?.data?.accessToken;

      if (accessToken) {
        // 1. 기기에 토큰 저장 (자동 로그인용)
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

        // 2. 앱 전역 상태 업데이트
        if (setToken) {
          setToken(accessToken);
        }
      }
    },
  });
};

// 유저 정보 조회
export const useUserInfoQuery = () => {
  const { accessToken } = useAuth();
  return useQuery<GetUserInfoResponse>({
    queryKey: ['userInfo'],
    queryFn: getUserInfo,
    enabled: !!accessToken, // 토큰 존재할 때만 쿼리 실행
    // staleTime: Infinity,
  });
};

// 유저 정보 수정
export const useUpdateUserInfoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<UpdateUserResponse, Error, UpdateUserPayload>({
    mutationFn: updateUserInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInfo'] });
    },
  });
};

// 유저 삭제
export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  const { removeToken } = useAuth();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await removeToken(); // 앱 내 토큰 삭제
      queryClient.clear();
    },
  });
};

// 이메일 중복 확인
export const useCheckEmailMutation = () => {
  return useMutation({
    mutationFn: postCheckEmail,
  });
};
