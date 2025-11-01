import { RootStackParamList } from '@/app/types';
import {
  CheckEmailPayload,
  CreateUserPayload,
  GetUserInfoResponse,
  LoginUserPayload,
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
import {
  CommonActions,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

// 유저 회원가입
export const useCreateUserMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => postCreateUser(payload),
  });
  return mutation;
};

// 유저 로그인
export const useLoginUserMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: LoginUserPayload) => postLoginUser(payload),
  });
  return mutation;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInfo'] });
    },
  });
};

// 유저 삭제
export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const mutation = useMutation({
    mutationFn: () => deleteUser(),
    onSuccess: async (res) => {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      queryClient.clear();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        }),
      );
    },
    onError: async () => {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      queryClient.clear();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        }),
      );
      Alert.alert('회원탈퇴 중 문제가 발생했습니다.');
    },
  });
  return mutation;
};

// 이메일 중복 확인
export const useCheckEmailMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: CheckEmailPayload) => postCheckEmail(payload),
  });
  return mutation;
};
