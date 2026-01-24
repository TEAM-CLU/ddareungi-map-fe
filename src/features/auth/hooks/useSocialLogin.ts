import { RootStackParamList } from '@/app/types';
import {
  SocialAuthExchangeTokenPayload,
  SocialAuthExchangeTokenResponse,
  SocialAuthGetUrlResponse,
  SocialType,
} from '@/features/auth/model/auth.types';
import { useSocialAuthCheckStatusQuery } from '@/features/auth/services/auth.queries';
import { QueryClient, UseMutateFunction } from '@tanstack/react-query';
import { StackNavigationProp } from 'node_modules/@react-navigation/stack/lib/typescript/src/types';
import { useEffect, useRef, useState } from 'react';
import { Alert, AppState, Linking } from 'react-native';

interface UseSocialLoginParams {
  getSocialAuthUrl: UseMutateFunction<
    SocialAuthGetUrlResponse,
    Error,
    SocialType,
    unknown
  >;
  exchangeToken: UseMutateFunction<
    SocialAuthExchangeTokenResponse,
    Error,
    SocialAuthExchangeTokenPayload,
    unknown
  >;
  isSocialLoading: boolean;
  setToken: (token: string) => Promise<void>;
  navigation: StackNavigationProp<RootStackParamList>;
  queryClient: QueryClient;
}

export const useSocialLogin = ({
  getSocialAuthUrl,
  exchangeToken,
  isSocialLoading,
  setToken,
  navigation,
  queryClient,
}: UseSocialLoginParams) => {
  const [canStartPolling, setCanStartPolling] = useState<boolean>(false);
  const clientState = useRef<string>('');
  const codeVerifier = useRef<string>('');
  const waitingForAuth = useRef(false);

  const isDisabled =
    isSocialLoading || waitingForAuth.current || canStartPolling;

  const handleSocialLoginButtonPress = (socialType: SocialType) => {
    getSocialAuthUrl(socialType, {
      onSuccess: response => {
        const { authUrl, state, codeVerifier: verifier } = response.data;
        if (!authUrl || !state || !verifier) {
          resetFlow();
          Alert.alert('오류', '로그인 정보를 받아오지 못했습니다.');
          return;
        }
        clientState.current = state;
        codeVerifier.current = verifier;
        waitingForAuth.current = true;
        Linking.openURL(authUrl).catch(() => {
          resetFlow();
          Alert.alert('오류', '앱 외부로 연결하는데 실패했습니다.');
        });
      },

      onError: error => {
        resetFlow();
        Alert.alert('오류', error.message);
      },
    });
  };

  const { data: loginStatusInfo } = useSocialAuthCheckStatusQuery({
    pollMs: 3000,
    canRun: canStartPolling,
    payloadForApi: { clientState: clientState.current },
  });

  const resetFlow = () => {
    setCanStartPolling(false);
    clientState.current = '';
    codeVerifier.current = '';
    waitingForAuth.current = false;
  };

  // 앱이 포그라운드로 돌아왔을 때 폴링 시작
  useEffect(() => {
    const sub = AppState.addEventListener('change', status => {
      if (
        status === 'active' &&
        waitingForAuth.current &&
        clientState.current
      ) {
        setCanStartPolling(true);
        waitingForAuth.current = false;
      }
    });
    return () => sub.remove();
  }, []);

  // 토큰 교환
  useEffect(() => {
    const statusData = loginStatusInfo?.data;

    if (!statusData?.isComplete || !statusData?.state) {
      return;
    }

    if (clientState.current !== statusData.state) {
      resetFlow();
      Alert.alert('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const payload = { codeVerifier: codeVerifier.current };
    exchangeToken(payload, {
      onSuccess: async response => {
        try {
          const accessToken = response.data.accessToken;

          if (!accessToken) {
            throw new Error('No Access Token');
          }

          // 1. 폴링 중단 및 쿼리 정리 (계속 요청하는 것 방지)
          setCanStartPolling(false);
          const queryKey = [
            'auth',
            'check-status',
            clientState.current,
          ] as const;
          await queryClient.cancelQueries({ queryKey });
          queryClient.removeQueries({ queryKey, exact: true });

          // 2. 토큰 저장
          await setToken(accessToken);

          // 3. 화면 이동 (성공 시에만)
          navigation.navigate('Map');
        } catch (error) {
          console.error('로그인 처리 중 오류 발생:', error);
          resetFlow();
          setCanStartPolling(true); // 폴링 재시작
          Alert.alert(
            '오류',
            '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          );
        }
      },
      onError: error => {
        resetFlow();
        Alert.alert('오류', error.message);
      },
    });
  }, [loginStatusInfo, exchangeToken, queryClient, navigation, setToken]);

  return {
    isDisabled,
    handleSocialLoginButtonPress,
  };
};
