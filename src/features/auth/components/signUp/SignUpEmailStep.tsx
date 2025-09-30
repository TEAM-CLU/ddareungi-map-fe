import Input from '@/shared/components/Input/Input';
import { useEffect, useState } from 'react';
import { tw } from '@/shared/libs/tw-helper';

import { Text, View } from 'react-native';
import SquareButton from '@/shared/components/button/SquareButton';
import RoundButton from '@/shared/components/button/RoundButton';

interface SignUpEmailStepProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setSignUpStep: React.Dispatch<
    React.SetStateAction<'email' | 'password' | 'profile' | 'permission'>
  >;
}
const SignUpEmailStep = ({
  email,
  setEmail,
  setSignUpStep,
}: SignUpEmailStepProps) => {
  const [isValidEmail, setIsValidEmail] = useState<boolean>(true); // 중복확인
  const [code, setCode] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isValidCode, setIsValidCode] = useState<boolean>(false);
  const [showCodeInput, setShowCodeInput] = useState<boolean>(false);

  const handleCheckRedundancyButton = () => {
    //TODO: API쏴서 중복확인후 isValidEmail 상태변경, false라면 바로 종료 true라면 타이머와 함께 코드기입 input 렌더링
  };
  useEffect(() => {
    if (!!email && isValidEmail && isValidCode) setIsAvailable(true);
  }, [email, isValidEmail, isValidCode]);
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
          이메일을
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
            tw('flex w-full items-center justify-between flex-nowrap'),
            showCodeInput ? tw('flex-col items-end') : tw(' flex-row'),
            { gap: 10 },
          ]}
        >
          {showCodeInput ? (
            <Input
              type="number"
              placeholder="코드를 입력하세요."
              value="code"
              onChangeText={setCode}
              isValid={isValidCode}
            />
          ) : isValidEmail ? (
            <View></View>
          ) : (
            <Text style={[tw('font-primary-500 text-error'), { fontSize: 13 }]}>
              중복된 이메일 입니다.
            </Text>
          )}
          {showCodeInput ? (
            <RoundButton
              title="코드확인"
              onPress={() => {}}
              preset="sm"
              disabled={!isValidCode}
            />
          ) : (
            <RoundButton title="중복확인" onPress={() => {}} preset="sm" />
          )}
        </View>
      </View>
      <SquareButton
        title="다음"
        onPress={() => setSignUpStep('password')}
        disabled={!isAvailable}
      />
    </View>
  );
};

export default SignUpEmailStep;
