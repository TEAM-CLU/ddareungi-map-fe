import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  View,
  Linking,
} from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import AuthChoice from '@/features/auth/components/AuthChoice';
import AuthGateway from '@/features/auth/components/AuthGateway';
import SimpleLoading from '@/shared/components/LoginLoading';
import { useSocialAuthExchangeTokenMutation } from '@/features/auth/services/auth.queries';
import {
  SocialAuthExchangeTokenPayload,
  SocialAuthExchangeTokenResponse,
} from '@/features/auth/model/auth.types';
import {
  NavigationProp,
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { RootStackParamList } from '@/app/types';

type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const { mutateAsync: socialLoginExchangeToken } =
    useSocialAuthExchangeTokenMutation();
  const [loginScreenStep, setLoginScreenStep] = useState<'step1' | 'step2'>(
    'step1',
  );
  const [isLoading, setIsLoading] = useState(false);

  const [state, setState] = useState<string>('');
  const [codeVerifier, setCodeVerifier] = useState<string>('');

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<LoginScreenRouteProp>();
  const stateRef = useRef(state);
  const codeVerifierRef = useRef(codeVerifier);

  useEffect(() => {
    stateRef.current = state;
    codeVerifierRef.current = codeVerifier;
  }, [state, codeVerifier]);

  useEffect(() => {
    let mounted = true;

    const processUrl = async (url: string) => {
      if (!mounted || !url) return;

      console.log('🔗 [딥링크 감지]', url);

      try {
        // URL 파싱: regex로 쿼리 파라미터 추출 (타입 호환성 고려)
        const receivedState = url.match(/[?&]state=([^&]+)/)?.[1] || '';
        console.log('📦 [파싱된 state]', receivedState);
        console.log('💾 [저장된 state]', stateRef.current);
        console.log(
          '🔑 [codeVerifier]',
          codeVerifierRef.current ? '존재함' : '없음',
        );

        // state가 없으면 에러로 간주 (백엔드가 에러 시 state 없이 딥링크 호출)
        if (!receivedState) {
          console.error('❌ [소셜 로그인 에러] state 파라미터 없음');
          Alert.alert(
            '로그인 실패',
            '소셜 로그인 처리 중 오류가 발생했습니다.',
          );
          return;
        }

        if (
          stateRef.current &&
          codeVerifierRef.current &&
          receivedState === stateRef.current
        ) {
          setIsLoading(true);

          const payload: SocialAuthExchangeTokenPayload = {
            codeVerifier: codeVerifierRef.current,
            state: stateRef.current,
          };

          try {
            const response: SocialAuthExchangeTokenResponse =
              await socialLoginExchangeToken(payload);

            if ('statusCode' in response && response.statusCode === 401) {
              throw new Error('Unauthorized');
            }

            if (!mounted) return;
            setIsLoading(false);
            Alert.alert('로그인 성공', '환영합니다!');
            navigation.navigate('Map');
          } catch (err) {
            if (!mounted) return;
            setIsLoading(false);
            Alert.alert(`${err}`);
            setState('');
            setCodeVerifier('');
          }
        }
      } catch (_) {
        // URL parsing 실패 등은 무시
      }
    };

    const onUrl = (event: { url: string } | string) => {
      const url = typeof event === 'string' ? event : event.url;
      processUrl(url);
    };

    // 앱이 cold start 되었을 때의 초기 URL 처리
    (async () => {
      try {
        const initial = await Linking.getInitialURL();
        console.log('🚀 [초기 URL]', initial || '없음');
        if (initial) processUrl(initial);
      } catch (e) {
        console.error('❌ [getInitialURL 에러]', e);
      }
    })();

    // in-app으로 돌아올 때 처리
    const subscription = Linking.addEventListener('url', onUrl as any);

    return () => {
      mounted = false;
      // cleanup listener
      if (subscription && typeof (subscription as any).remove === 'function') {
        (subscription as any).remove();
      }
    };
  }, [socialLoginExchangeToken, navigation]);

  if (isLoading) {
    return <SimpleLoading title="로그인 중..." />;
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={tw('flex flex-1 relative bg-surface-primary')}>
        {loginScreenStep === 'step1' ? (
          <AuthChoice setLoginScreenStep={setLoginScreenStep} />
        ) : loginScreenStep === 'step2' ? (
          <AuthGateway
            state={state}
            setState={setState}
            codeVerifier={codeVerifier}
            setCodeVerifier={setCodeVerifier}
            setLoginScreenStep={setLoginScreenStep}
          />
        ) : (
          <AuthChoice setLoginScreenStep={setLoginScreenStep} />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
