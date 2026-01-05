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
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import { ACCESS_TOKEN_KEY } from '@/shared/model/index.constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

// 유저 회원가입
export const useCreateUserMutation = () => {
  return useMutation({
    mutationFn: postCreateUser,
    onSuccess: data => {
      Alert.alert('알림', data.message);
    },
  });
};

// 유저 로그인
export const useLoginUserMutation = () => {
  const { navigation } = useAppNavigation();
  const { setToken } = useAuth();

  return useMutation({
    mutationFn: postLoginUser,

    // 성공 시: 토큰 저장 + 상태 업데이트 + 화면 이동
    onSuccess: async data => {
      const accessToken = data?.data?.accessToken;

      if (accessToken) {
        // 1. 기기에 토큰 저장 (자동 로그인용)
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        
        // 2. 앱 전역 상태 업데이트
        if (setToken) {
          setToken(accessToken);
        }

        // 3. 화면 이동
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Map' }],
          }),
        );
      } else {
        // 성공했으나 토큰이 없는 경우
        Alert.alert('로그인 실패', '토큰이 존재하지 않습니다.');
      }
    },
  });
};

// 유저 정보 조회
export const useUserInfoQuery = () => {
  return useQuery<GetUserInfoResponse>({
    queryKey: ['userInfo'],
    queryFn: getUserInfo,
    // staleTime: Infinity,
  });
};

// 유저 정보 수정
export const useUpdateUserInfoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<UpdateUserResponse, Error, UpdateUserPayload>({
    mutationFn: updateUserInfo,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['userInfo'] });
      Alert.alert('알림', data.message);
    },
  });
};

// 유저 삭제
export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  const { navigation } = useAppNavigation();
  const { removeToken } = useAuth();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: async data => {
      await removeToken(); // 앱 내 토큰 삭제
      queryClient.clear();

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        }),
      );
      Alert.alert('알림', data.message);
    },
  });
};

// 이메일 중복 확인
export const useCheckEmailMutation = () => {
  return useMutation({
    mutationFn: postCheckEmail,
    onSuccess: data => {
      Alert.alert('알림', data.message);
    },
  });
};
