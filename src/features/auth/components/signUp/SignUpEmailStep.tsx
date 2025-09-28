import Input from '@/shared/components/Input/Input';
import { useState } from 'react';
import { tw } from '@/shared/libs/tw-helper';

import { Text, View } from 'react-native';
import SquareButton from '@/shared/components/button/SquareButton';
import RoundButton from '@/shared/components/button/RoundButton';

interface SignUpEmailStepProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setSignUpStep: React.Dispatch<
    React.SetStateAction<'email' | 'password' | 'profile'>
  >;
}
const SignUpEmailStep = ({
  email,
  setEmail,
  setSignUpStep,
}: SignUpEmailStepProps) => {
  const [isValidEmail, setIsValidEmail] = useState<boolean>(true);
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
          번호를
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
          type="text"
          placeholder="이메일을 입력하세요."
          value={email}
          onChangeText={setEmail}
          isValid={isValidEmail}
        />
        <View
          style={[
            tw('flex flex-row w-full items-center justify-between flex-nowrap'),
            { gap: 1 },
          ]}
        >
          {isValidEmail ? (
            <View></View>
          ) : (
            <Text style={[tw('font-primary-500 text-error'), { fontSize: 13 }]}>
              중복된 이메일 입니다.
            </Text>
          )}
          <RoundButton title="인증하기" onPress={() => {}} preset="sm" />
        </View>
      </View>
      <SquareButton
        title="다음"
        onPress={() => setSignUpStep('password')}
        disabled={!isValidEmail}
      />
    </View>
  );
};

export default SignUpEmailStep;
