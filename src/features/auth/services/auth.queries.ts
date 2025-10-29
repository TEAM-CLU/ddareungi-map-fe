import { RootStackParamList } from '@/app/types';
import {
  ResetPasswordPayload,
  SendVerificationEmailPayload,
  SocialAuthType,
  VerifyEmailPayload,
} from '@/features/auth/model/auth.types';
import {
  getSocialAuth,
  postLogout,
  postResetPassword,
  postSendVerificationEmail,
  postVerifyEmail,
} from '@/features/auth/services/auth.api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CommonActions,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

// // 소셜 회원가입/로그인 PKCE-> get이지만 토큰 취득이란 행위에 포커싱, mutation으로 지정 / useQuery는 바로 자동요청 되므로...
// export const useSocialAuthPkceMutation = () => {
//   const mutation = useMutation({
//     mutationFn: (socialType: SocialAuthType) => getSocialAuthPkce(socialType),
//   });

//   return mutation;
// };

// // 소셜 회원가입/로그인 exhange token
// export const useSocialAuthExchangeTokenMutation = () => {
//   const mutation = useMutation({
//     mutationFn: (payload: SocialAuthExchangeTokenPayload) =>
//       postSocialAuthExchangeToken(payload),
//   });

//   return mutation;
// };

// 소셜 회원가입/로그인
export const useSocialAuthMutation = () => {
  const mutation = useMutation({
    mutationFn: (socialAuthType: SocialAuthType) =>
      getSocialAuth(socialAuthType),
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
    onSuccess: data => {
      AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
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
