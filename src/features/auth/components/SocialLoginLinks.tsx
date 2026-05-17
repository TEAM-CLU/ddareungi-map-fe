import { TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { IconGoogle, IconNaver, IconKakao } from '@/shared/components/icons';
import { useAuth } from '@/app/providers';
import {
  useSocialAuthExchangeTokenMutation,
  useSocialAuthGetUrlMutation,
} from '@/features/auth/services/auth.queries';
import { useQueryClient } from '@tanstack/react-query';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import { useSocialLogin } from '@/features/auth/hooks/useSocialLogin';

const SocialLoginLinks = () => {
  const { setToken } = useAuth();
  const { mutate: getSocialAuthUrl, isPending: isSocialLoading } =
    useSocialAuthGetUrlMutation();
  const { mutate: exchangeToken } = useSocialAuthExchangeTokenMutation();
  const { navigation } = useAppNavigation();

  const queryClient = useQueryClient();

  const { isDisabled, handleSocialLoginButtonPress } = useSocialLogin({
    getSocialAuthUrl,
    exchangeToken,
    isSocialLoading,
    setToken,
    navigation,
    queryClient,
  });

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
