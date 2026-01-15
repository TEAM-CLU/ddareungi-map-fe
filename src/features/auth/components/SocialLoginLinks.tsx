import { Alert, AppState, Linking, TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { IconGoogle, IconNaver, IconKakao } from '@/shared/components/icons';
import { useAuth } from '@/app/providers';
import { useEffect, useRef, useState } from 'react';
import { SocialType } from '@/features/auth/model/auth.types';
import {
  useSocialAuthCheckStatusQuery,
  useSocialAuthExchangeTokenMutation,
  useSocialAuthGetUrlMutation,
} from '@/features/auth/services/auth.queries';
import { useQueryClient } from '@tanstack/react-query';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';

const SocialLoginLinks = () => {
  const { setToken } = useAuth();

  const { mutate: getSocialAuthUrl, isPending: isSocialLoading } =
    useSocialAuthGetUrlMutation();
  const { mutate: exchangeToken } = useSocialAuthExchangeTokenMutation();

  const [canStartPolling, setCanStartPolling] = useState<boolean>(false);
  const clientState = useRef<string>('');
  const codeVerifier = useRef<string>('');
  const waitingForAuth = useRef(false);

  const queryClient = useQueryClient();

  const { navigation } = useAppNavigation();

  const isDisabled = isSocialLoading || waitingForAuth.current || canStartPolling;

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
        const accesssToken = response.data.accessToken;

        if (!accesssToken) {
          resetFlow();
          Alert.alert(
            '오류',
            '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          );
          return;
        }

        // 1. 폴링 중단 및 쿼리 정리 (계속 요청하는 것 방지)
        setCanStartPolling(false);
        const queryKey = ['auth', 'check-status', clientState.current] as const;
        await queryClient.cancelQueries({ queryKey });
        queryClient.removeQueries({ queryKey, exact: true });

        // 2. 토큰 저장
        await setToken(accesssToken);

        // 3. 화면 이동
        navigation.navigate('Map');
      },
      onError: error => {
        resetFlow();
        Alert.alert('오류', error.message);
      },
    });
  }, [loginStatusInfo, exchangeToken, queryClient, navigation]);

  return (
    <View
      style={[
        tw('flex flex-row justify-center items-center flex-nowrap w-full'),
        { gap: 15, maxWidth: 230 },
      ]}
    >
      <TouchableOpacity
        onPress={() => handleSocialLoginButtonPress('kakao')}
        style={[
          tw(
            'flex justify-center items-center rounded-full bg-surface-primary border',
          ),
          {
            backgroundColor: '#FBE300',
            width: 47,
            height: 47,
            borderColor: '#FBE300',
          },
        ]}
        disabled={isDisabled}
      >
        <IconKakao size={32} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleSocialLoginButtonPress('google')}
        style={[
          tw(
            'flex justify-center items-center rounded-full bg-surface-primary border-line-default border',
          ),
          { width: 47, height: 47 },
        ]}
        disabled={isDisabled}
      >
        <IconGoogle />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleSocialLoginButtonPress('naver')}
        style={[
          tw(
            'flex justify-center items-center rounded-full bg-surface-primary  border',
          ),
          {
            backgroundColor: '#03C75A',
            width: 47,
            height: 47,
            borderColor: '#03C75A',
          },
        ]}
        disabled={isDisabled}
      >
        <IconNaver size={45} />
      </TouchableOpacity>
    </View>
  );
};

export default SocialLoginLinks;
