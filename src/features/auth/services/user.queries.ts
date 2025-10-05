import {
  CheckEmailPayload,
  CreateUserPayload,
  LoginUserPayload,
} from '@/features/auth/model/auth.types';
import {
  postCheckEmail,
  postCreateUser,
  postLoginUser,
} from '@/features/auth/services/user.api';
import { useMutation } from '@tanstack/react-query';

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

// 이메일 중복 확인
export const useCheckEmailMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: CheckEmailPayload) => postCheckEmail(payload),
  });
  return mutation;
};
