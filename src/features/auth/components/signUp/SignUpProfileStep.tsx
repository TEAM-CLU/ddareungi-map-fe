import Input from '@/shared/components/Input/Input';
import { useState } from 'react';
import { tw } from '@/shared/libs/tw-helper';

import { Alert, Text, View } from 'react-native';
import SquareButton from '@/shared/components/button/SquareButton';
import RoundButton from '@/shared/components/button/RoundButton';
import { checkPassword } from '@/features/auth/utils/checkPassword';

interface SignUpEmailStepProps {
  pwd: string;
  setPwd: React.Dispatch<React.SetStateAction<string>>;
  confirmPwd: string;
  setConfirmPwd: React.Dispatch<React.SetStateAction<string>>;
  setSignUpStep: React.Dispatch<
    React.SetStateAction<'email' | 'password' | 'profile'>
  >;
}
const SignUpPwdStep = ({
  pwd,
  setPwd,
  confirmPwd,
  setConfirmPwd,
  setSignUpStep,
}: SignUpEmailStepProps) => {
  const [isValidPwd, setIsValidPwd] = useState<boolean>(true);
  const [isValidConfirmPwd, setIsValidConfirmPwd] = useState<boolean>(true);
  const [showValidation, setShowValidation] = useState(false);

  const handleProvePwdButtonPress = () => {
    const isOkPwd = checkPassword(pwd);
    setIsValidPwd(isOkPwd);

    if (!isOkPwd) {
      Alert.alert('양식 확인', '비밀번호 양식이 올바르지 않습니다.');
      return;
    }

    const isOkConfirmPwd = pwd === confirmPwd;
    setIsValidConfirmPwd(isOkConfirmPwd);

    setShowValidation(true);
  };
  return (
    <View
      style={[
        tw('w-full flex-1 flex flex-col justify-between items-center'),
        { marginTop: 55 },
      ]}
    >
      <View style={[tw('flex flex-col w-full'), { gap: 3 }]}>
        <Text
          style={[
            tw('font-primary-700 text-on-surface-primary text-left'),
            { fontSize: 24 },
          ]}
        >
          비밀번호를
        </Text>
        <Text
          style={[
            tw('font-primary-700 text-on-surface-primary text-left'),
            { fontSize: 24 },
          ]}
        >
          입력해주세요.
        </Text>
      </View>
      <View
        style={[tw('flex flex-col w-full'), { gap: 12, marginBottom: 100 }]}
      >
        <Input
          type="password"
          placeholder="비밀번호를 입력하세요."
          value={pwd}
          onChangeText={setPwd}
          isValid={isValidPwd}
        />
        <Text
          style={[tw('font-primary-500 text-brand-primary'), { fontSize: 13 }]}
        >
          8자 이상, 특수기호 1개 이상 포함
        </Text>
        <Input
          type="password"
          placeholder="비밀번호를 다시 한번 입력하세요."
          value={confirmPwd}
          onChangeText={setConfirmPwd}
          isValid={isValidConfirmPwd}
        />
        <View
          style={[
            tw('flex flex-row w-full items-center justify-between flex-nowrap'),
            { gap: 1 },
          ]}
        >
          <View>
            {showValidation &&
              (isValidConfirmPwd ? (
                <Text
                  style={[
                    tw('font-primary-500 text-brand-primary'),
                    { fontSize: 13 },
                  ]}
                >
                  비밀번호가 일치합니다.
                </Text>
              ) : (
                <Text
                  style={[tw('font-primary-500 text-error'), { fontSize: 13 }]}
                >
                  비밀번호가 일치하지 않습니다.
                </Text>
              ))}
          </View>

          <RoundButton
            title="인증하기"
            onPress={handleProvePwdButtonPress}
            preset="sm"
          />
        </View>
      </View>
      <SquareButton
        title="다음"
        onPress={() => setSignUpStep('profile')}
        disabled={!(isValidPwd && isValidConfirmPwd)}
      />
    </View>
  );
};

export default SignUpPwdStep;
