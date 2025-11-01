import { RootStackParamList } from '@/app/types';
import {
  FindAccountPayload,
  ResetPasswordPayload,
  SendVerificationEmailPayload,
  SocialAuthCheckStatusQueryPayload,
  SocialAuthCheckStatusResponse,
  SocialAuthExchangeTokenPayload,
  SocialType,
  VerifyEmailPayload,
} from '@/features/auth/model/auth.types';
import {
  postLogout,
  getSocialAuthCheckStatus,
  getSocialAuthUrl,
  postFindAccount,
  postResetPassword,
  postSendVerificationEmail,
  postSocialAuthExchangeToken,
  postVerifyEmail,
} from '@/features/auth/services/auth.api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CommonActions,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { ACCESS_TOKEN_KEY } from '@/shared/model/index.constants';

// 이메일 인증 코드 발송
export const useSendVerificationEmailMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: SendVerificationEmailPayload) =>
      postSendVerificationEmail(payload),
  });

  return mutation;
};

// 이메일 인증 코드 확인
export const useVerifyEmailMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: VerifyEmailPayload) => postVerifyEmail(payload),
  });

  return mutation;
};

// 계정 찾기
export const useFindAccountMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: FindAccountPayload) => postFindAccount(payload),
  });

  return mutation;
};

// 비밀번호 재설정(비밀번호 찾기)
export const useResetPasswordMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: ResetPasswordPayload) => postResetPassword(payload),
  });

  return mutation;
};

// 로그아웃
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const mutation = useMutation({
    mutationFn: postLogout,
    onSuccess: async data => {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      queryClient.clear();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        }),
      );
      if (data?.message) {
        Alert.alert(data.message);
      }
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
      Alert.alert('로그아웃 중 문제가 발생했습니다.');
    },
  });

  return mutation;
};

// 소셜 회원가입/로그인 auth url 요청 - 사용자가 버튼을 눌렀을때만 작동하도록 mutaation으로 구현
export const useSocialAuthGetUrlMutation = () => {
  const mutation = useMutation({
    mutationFn: (socialType: SocialType) => getSocialAuthUrl(socialType),
  });

  return mutation;
};

// 소셜 회원가입/로그인 상태 확인
export const useSocialAuthCheckStatusQuery = (
  payload: SocialAuthCheckStatusQueryPayload,
) => {
  return useQuery({
    queryKey: [
      'auth',
      'check-status',
      payload.payloadForApi.clientState,
    ] as const,
    queryFn: async ({ signal }) => {
      if (!!payload.canRun && payload.payloadForApi) {
        const response = await getSocialAuthCheckStatus(
          payload.payloadForApi,
          signal,
        );
        return response;
      }
      return null;
    },
    enabled: payload.canRun,
    staleTime: 0,
    gcTime: 2 * 60 * 1000,
    refetchInterval: query => {
      const queryData = query.state.data as
        | SocialAuthCheckStatusResponse
        | null
        | undefined;
      if (!queryData) return payload.pollMs ?? 3000;
      return queryData.data.isComplete
        ? false
        : queryData.data.recommendedPollingInterval ?? 3000;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always',
  });
};

// 소셜 회원가입/로그인 토큰 교환
export const useSocialAuthExchangeTokenMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: SocialAuthExchangeTokenPayload) =>
      postSocialAuthExchangeToken(payload),
  });

  return mutation;
};
