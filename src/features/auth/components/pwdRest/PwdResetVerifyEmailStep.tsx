import Input from '@/shared/components/Input/Input';
import { useEffect, useState } from 'react';
import { tw } from '@/shared/libs/tw-helper';
import { Text, View } from 'react-native';
import SquareButton from '@/shared/components/button/SquareButton';
import RoundButton from '@/shared/components/button/RoundButton';

interface PwdResetVerifyEmailStepProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPwdResetStep: React.Dispatch<React.SetStateAction<1 | 2>>;
}

const PwdResetVerifyEmailStep = ({
  email,
  setEmail,
  setPwdResetStep,
}: PwdResetVerifyEmailStepProps) => {
  const [isValidEmail, setIsValidEmail] = useState<boolean>(true);
  const [code, setCode] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isValidCode, setIsValidCode] = useState<boolean>(false);
  const [showCodeInput, setShowCodeInput] = useState<boolean>(false);

  const handleSendCodeButton = () => {
    // TODO: API로 이메일에 인증코드 전송
    setShowCodeInput(true);
  };

  const handleVerifyCodeButton = () => {
    // TODO: API로 코드 검증
    setIsValidCode(true);
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
          가입한 이메일을
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
            showCodeInput ? tw('flex-col items-end') : tw('flex-row'),
            { gap: 10 },
          ]}
        >
          {showCodeInput ? (
            <Input
              type="number"
              placeholder="인증코드를 입력하세요."
              value={code}
              onChangeText={setCode}
              isValid={isValidCode}
            />
          ) : !isValidEmail ? (
            <Text style={[tw('font-primary-500 text-error'), { fontSize: 13 }]}>
              등록되지 않은 이메일입니다.
            </Text>
          ) : (
            <View />
          )}

          {showCodeInput ? (
            <RoundButton
              title="코드확인"
              onPress={handleVerifyCodeButton}
              preset="sm"
              disabled={!code}
            />
          ) : (
            <RoundButton
              title="인증코드 전송"
              onPress={handleSendCodeButton}
              preset="sm"
              disabled={!email}
            />
          )}
        </View>
      </View>

      <SquareButton
        title="다음"
        onPress={() => setPwdResetStep(2)}
        disabled={!isAvailable}
      />
    </View>
  );
};

export default PwdResetVerifyEmailStep;
