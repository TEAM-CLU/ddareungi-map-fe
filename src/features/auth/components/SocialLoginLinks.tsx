import {
  Alert,
  AppState,
  Linking,
  Modal,
  TouchableOpacity,
  View,
} from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import IconGoogle from '@/shared/components/icons/IconGoogle';
import IconKakao from '@/shared/components/icons/IconKakao';
import IconNaver from '@/shared/components/icons/IconNaver';
import { useAuth } from '@/app/providers';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/app/types';
import { useEffect, useRef, useState } from 'react';
import {
  SocialAuthExchangeTokenResponse,
  SocialAuthGetUrlResponse,
  SocialType,
} from '@/features/auth/model/auth.types';
import {
  useSocialAuthCheckStatusQuery,
  useSocialAuthExchangeTokenMutation,
  useSocialAuthGetUrlMutation,
} from '@/features/auth/services/auth.queries';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface SocialLoginLinksProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const SocialLoginLinks = ({ setIsLoading }: SocialLoginLinksProps) => {
  const { setToken } = useAuth();
  const { mutateAsync: getAuthUrl } = useSocialAuthGetUrlMutation();
  const { mutateAsync: exchangeToken } = useSocialAuthExchangeTokenMutation();
  const [canStartPolling, setCanStartPolling] = useState<boolean>(false);
  const clientState = useRef<string>('');
  const codeVerifier = useRef<string>('');
  const waitingForAuth = useRef(false);

  const queryClient = useQueryClient();

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleSocialLoginButtonPress = async (socialType: SocialType) => {
    setIsLoading(true);

    try {
      const response: SocialAuthGetUrlResponse = await getAuthUrl(socialType);
      if (!response.authUrl || !response.state || !response.codeVerifier) {
        resetFlow();
        return;
      }
      Linking.openURL(response.authUrl);
      clientState.current = response.state;
      codeVerifier.current = response.codeVerifier;
      waitingForAuth.current = true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        resetFlow();
        Alert.alert(
          `${error.response?.data?.message || '요청 실패. 다시 시도해주세요.'}`,
        );
      }
    }
  };
  const { data: loginStatusInfo } = useSocialAuthCheckStatusQuery({
    pollMs: 3000,
    canRun: canStartPolling,
    payloadForApi: { clientState: clientState.current },
  });

  const resetFlow = () => {
    setIsLoading(false);
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
    const handleSocialLogin = async () => {
      if (!loginStatusInfo?.isComplete || !loginStatusInfo?.state) {
        return;
      }

      if (clientState.current !== loginStatusInfo.state) {
        resetFlow();
        Alert.alert(
          '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        );
        return;
      }
      try {
        const payload = { codeVerifier: codeVerifier.current };
        const response: SocialAuthExchangeTokenResponse = await exchangeToken(
          payload,
        );
        if (!response.accessToken) {
          resetFlow();
          Alert.alert(
            '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          );
          return;
        }
        setCanStartPolling(false);
        const key = ['auth', 'check-status', clientState.current] as const;
        await queryClient.cancelQueries({ queryKey: key });
        queryClient.removeQueries({ queryKey: key, exact: true });
        setToken(response.accessToken);
        navigation.navigate('Map');
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        resetFlow();
        if (axios.isAxiosError(error)) {
          Alert.alert(
            `${
              error.response?.data?.message || '요청 실패. 다시 시도해주세요.'
            }`,
          );
        }
      }
    };
    handleSocialLogin();
  }, [loginStatusInfo]);

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
      >
        <IconNaver size={45} />
      </TouchableOpacity>
    </View>
  );
};

export default SocialLoginLinks;
