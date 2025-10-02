import { Alert, Linking, TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import IconGoogle from '@/shared/components/icons/IconGoogle';
import IconKakao from '@/shared/components/icons/IconKakao';
import IconNaver from '@/shared/components/icons/IconNaver';
import {
  useSocialAuthPkceCallbackMutation,
  useSocialAuthPkceMutation,
} from '@/features/auth/services/auth.queries';
import {
  SocialAuthPkceResponse,
  SocialAuthType,
} from '@/features/auth/model/auth.types';

const SocialLoginLinks = () => {
  const { mutateAsync: socialLogin } = useSocialAuthPkceMutation();
  const { mutateAsync: socialLoginCallback } =
    useSocialAuthPkceCallbackMutation();

  const handleSocialLogin = async (socialType: SocialAuthType) => {
    // 1. PKCE 요청
    // try {
    //   const response: SocialAuthPkceResponse = await socialLogin(socialType);
    //   // 2. 소셜 로그인 창 오픈(앱)
    //   await Linking.openURL(response.authUrl);
    // } catch (error) {
    //   Alert.alert('Error', 'Failed to initiate social login');
    // }
  };
  return (
    <View
      style={[
        tw('flex flex-row justify-center items-center flex-nowrap w-full'),
        { gap: 15, maxWidth: 230 },
      ]}
    >
      <TouchableOpacity
        onPress={() => handleSocialLogin('kakao')}
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
        onPress={() => handleSocialLogin('google')}
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
        onPress={() => handleSocialLogin('naver')}
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
