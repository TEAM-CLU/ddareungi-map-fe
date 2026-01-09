import AccountLinks from '@/features/auth/components/AccountLinks';
import SocialLoginLinks from '@/features/auth/components/SocialLoginLinks';
import { useLoginUserMutation } from '@/features/auth/services/user.queries';
import SquareButton from '@/shared/components/button/SquareButton';
import IconClose from '@/shared/components/icons/IconClose';
import Input from '@/shared/components/Input/Input';
import { tw } from '@/shared/libs/tw-helper';
import { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AccountFinder from '@/features/auth/components/AccountFinder';
import PwdResetContainer from '@/features/auth/components/pwdReset/PwdResetContainer';
import { CommonActions } from '@react-navigation/native';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';

interface AuthGatewayProps {
  setLoginScreenStep: React.Dispatch<React.SetStateAction<1 | 2>>;
}

const AuthGateway = ({ setLoginScreenStep }: AuthGatewayProps) => {
  const { mutate: login } = useLoginUserMutation();
  const { navigation } = useAppNavigation();

  const [id, setId] = useState<string>('');
  const [pwd, setPwd] = useState<string>('');
  const [isIdValid, setIsIdValid] = useState<boolean>(true);
  const [isPwdValid, setIsPwdValid] = useState<boolean>(true);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [accountFeatures, setAccountFeatures] = useState<
    'findAccount' | 'resetPwd' | null
  >(null);

  useEffect(() => {
    if (!!id && !!pwd) {
      setIsAvailable(true);
    }
  }, [id, pwd]);

  const handleCloseButtonPress = () => setLoginScreenStep(1);

  const handleLoginButtonPress = async () => {
    // 아이디 입력 검사
    if (id.trim() === '') {
      Alert.alert('아이디를 입력해주세요.');
      setIsIdValid(false);
      return;
    }

    // 아이디 양식 검사(이메일 양식과 동일)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(id)) {
      Alert.alert('올바른 이메일 형식으로 입력해주세요.');
      setIsIdValid(false);
      return;
    }

    // 비밀번호 입력 검사
    if (pwd.trim() === '') {
      Alert.alert('비밀번호를 입력해주세요.');
      setIsPwdValid(false);
      return;
    }

    // 비밀번호 양식 검사 (영어, 숫자 포함 8자 이상, 특수문자 허용)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(pwd)) {
      Alert.alert('비밀번호는 영어, 숫자 포함 8자 이상이어야 합니다.');
      setIsPwdValid(false);
      return;
    }

    const payload = {
      email: id,
      password: pwd,
    };

    login(payload, {
      onSuccess: data => {
        const accessToken = data?.data?.accessToken;
        if (accessToken) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Map' }],
            }),
          );
        } else {
          // 성공했으나 토큰이 없는 경우
          Alert.alert('로그인 실패', '토큰이 존재하지 않습니다.');
        }
      },
      onError: error => {
        Alert.alert('로그인 실패', error.message);
        setIsIdValid(false);
        setIsPwdValid(false);
      },
    });
  };

  useEffect(() => {
    setIsIdValid(true);
    setIsPwdValid(true);
  }, [id, pwd]);

  if (accountFeatures === 'findAccount')
    return <AccountFinder setAccountFeatures={setAccountFeatures} />;
  if (accountFeatures === 'resetPwd')
    return <PwdResetContainer setAccountFeatures={setAccountFeatures} />;

  return (
    <SafeAreaView style={tw('w-full flex-1 bg-surface-primary mb-20')}>
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
            onPress={handleLoginButtonPress}
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
          <SocialLoginLinks />
        </View>
        <View />
      </View>
    </SafeAreaView>
  );
};

export default AuthGateway;
