import { Alert, Linking, TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import IconGoogle from '@/shared/components/icons/IconGoogle';
import IconKakao from '@/shared/components/icons/IconKakao';
import IconNaver from '@/shared/components/icons/IconNaver';
import {
  useSocialAuthExchangeTokenMutation,
  useSocialAuthPkceMutation,
} from '@/features/auth/services/auth.queries';
import {
  SocialAuthPkceResponse,
  SocialAuthType,
} from '@/features/auth/model/auth.types';
import { useState } from 'react';

interface SocialLoginLinksProps {
  state: string;
  setState: React.Dispatch<React.SetStateAction<string>>;
  codeVerifier: string;
  setCodeVerifier: React.Dispatch<React.SetStateAction<string>>;
}

const SocialLoginLinks = ({
  state,
  setState,
  codeVerifier,
  setCodeVerifier,
}: SocialLoginLinksProps) => {
  const { mutateAsync: socialLoginPkce } = useSocialAuthPkceMutation();

  const handleSocialLoginButtonPress = async (
    socialAuthType: SocialAuthType,
  ) => {
    try {
      // 1.pkce authUrl 요청
      const response: SocialAuthPkceResponse = await socialLoginPkce(
        socialAuthType,
      );
      Alert.alert(`${response}`);
      // 2. state, codeVerifier 상태에 저장
      setState(response.state);
      setCodeVerifier(response.codeVerifier);

      // 처음 눌렀을때 왜 에러가 발생합니까?
      if (!state || !codeVerifier) {
        throw new Error('Invalid state or codeVerifier');
      }

      // 3.소셜 로그인 웹뷰 오픈
      await Linking.openURL(response.authUrl);
      return;
    } catch (error: any) {
      console.error('❌ [소셜 로그인 에러]', error);

      // 에러 메시지 추출
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        '소셜 로그인 요청에 실패했습니다.';

      Alert.alert('로그인 오류', errorMessage);
      return;
    }
  };

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
