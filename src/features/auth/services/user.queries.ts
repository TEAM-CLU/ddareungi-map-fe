import { useAuth } from '@/app/providers';
import {
  CheckEmailPayload,
  CreateUserPayload,
  GetUserInfoResponse,
  LoginUserPayload,
  UpdateUserPayload,
  UpdateUserResponse,
} from '@/features/auth/model/auth.types';
import {
  getUserInfo,
  postCheckEmail,
  postCreateUser,
  postLoginUser,
  updateUserInfo,
} from '@/features/auth/services/user.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
    staleTime: Infinity,
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

// 이메일 중복 확인
export const useCheckEmailMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: CheckEmailPayload) => postCheckEmail(payload),
  });
  return mutation;
};
