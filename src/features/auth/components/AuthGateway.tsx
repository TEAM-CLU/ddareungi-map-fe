import AccountLinks from '@/features/auth/components/AccountLinks';
import IdFinder from '@/features/auth/components/IdFinder';
import PwdResetterContainer from '@/features/auth/components/pwdRest/PwdResetContainer';
import SocialLoginLinks from '@/features/auth/components/SocialLoginLinks';
import SquareButton from '@/shared/components/button/SquareButton';
import IconClose from '@/shared/components/icons/IconClose';
import Input from '@/shared/components/Input/Input';
import SimpleLoading from '@/shared/components/LoginLoading';
import { tw } from '@/shared/libs/tw-helper';
import { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthGatewayProps {
  state: string;
  setState: React.Dispatch<React.SetStateAction<string>>;
  codeVerifier: string;
  setCodeVerifier: React.Dispatch<React.SetStateAction<string>>;
  setLoginScreenStep: React.Dispatch<React.SetStateAction<'step1' | 'step2'>>;
}

const AuthGateway = ({
  state,
  setState,
  codeVerifier,
  setCodeVerifier,
  setLoginScreenStep,
}: AuthGatewayProps) => {
  const [id, setId] = useState<string>('');
  const [pwd, setPwd] = useState<string>('');
  const [isIdValid, setIsIdValid] = useState<boolean>(true);
  const [isPwdValid, setIsPwdValid] = useState<boolean>(true);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [accountFeatures, setAccountFeatures] = useState<
    'findId' | 'resetPwd' | null
  >(null);

  useEffect(() => {
    if (!!id && !!pwd) {
      setIsAvailable(true);
    }
  }, [id, pwd]);

  const handleCloseButtonPress = () => setLoginScreenStep('step1');

  if (accountFeatures === 'findId')
    return <IdFinder setAccountFeatures={setAccountFeatures} />;
  if (accountFeatures === 'resetPwd')
    return <PwdResetterContainer setAccountFeatures={setAccountFeatures} />;

  return (
    <SafeAreaView style={tw('w-full flex-1 bg-surface-primary mb-20  ')}>
      <TouchableOpacity
        onPress={handleCloseButtonPress}
        style={tw('fixed top-5 left-4')}
      >
        <IconClose />
      </TouchableOpacity>
      <View
        style={[
          tw('flex flex-1 flex-col justify-around items-center mt-32'),
          { gap: 100 },
        ]}
      >
        <Text
          style={[
            tw('font-secondary text-brand-primary text-center'),
            { lineHeight: 110, fontSize: 64 },
          ]}
        >
          따릉이맵
        </Text>
        {/* middle container */}
        <View
          style={[
            tw('w-full flex flex-col justify-between items-center'),
            { gap: 16, maxWidth: 319 },
          ]}
        >
          {/* id/password */}
          <View style={[tw('w-full flex flex-col items-center'), { gap: 10 }]}>
            <Input
              type="text"
              placeholder="아이디"
              value={id}
              onChangeText={setId}
              isValid={isIdValid}
            />
            <Input
              type="password"
              placeholder="비밀번호"
              value={pwd}
              onChangeText={setPwd}
              isValid={isPwdValid}
            />
          </View>
          {/* loginButton */}
          <SquareButton
            title="로그인"
            onPress={() => {}}
            disabled={!isAvailable}
          />
          {/* relatedwithAuthFeatures */}
          <AccountLinks setAccountFeatures={setAccountFeatures} />
          <View
            style={[
              tw('flex flex-row justify-center items-center my-3'),
              { gap: 12 },
            ]}
          >
            <View
              style={[
                tw('max-w-24 w-full'),
                { height: 0.5, backgroundColor: '#CFCCD4' },
              ]}
            />
            <Text
              style={[
                tw('text-center font-primary-500'),
                { color: '#CFCCD4', fontSize: 10 },
              ]}
            >
              또는
            </Text>
            <View
              style={[
                tw('max-w-24 w-full'),
                { height: 0.5, backgroundColor: '#CFCCD4' },
              ]}
            />
          </View>
          <SocialLoginLinks
            state={state}
            setState={setState}
            codeVerifier={codeVerifier}
            setCodeVerifier={setCodeVerifier}
          />
        </View>
        <View />
      </View>
    </SafeAreaView>
  );
};

export default AuthGateway;
