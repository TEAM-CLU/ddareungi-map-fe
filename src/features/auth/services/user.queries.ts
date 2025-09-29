import {
  CreateUserPayload,
  LoginUserPayload,
} from '@/features/auth/model/auth.types';
import {
  postCreateUser,
  postLoginUser,
} from '@/features/auth/services/user.api';
import { useMutation } from '@tanstack/react-query';

// 유저 회원가입
export const useCreateUserMutation = () => {
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => postCreateUser(payload),
  });
};

// 유저 로그인
export const useLoginUserMutation = () => {
  return useMutation({
    mutationFn: (payload: LoginUserPayload) => postLoginUser(payload),
  });
};
