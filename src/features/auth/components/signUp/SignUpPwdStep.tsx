import Input from '@/shared/components/Input/Input';
import { useEffect, useState } from 'react';
import { tw } from '@/shared/libs/tw-helper';

import { Alert, Text, View } from 'react-native';
import SquareButton from '@/shared/components/button/SquareButton';
import RoundButton from '@/shared/components/button/RoundButton';

interface SignUpEmailStepProps {
  pwd: string;
  setPwd: React.Dispatch<React.SetStateAction<string>>;
  confirmPwd: string;
  setConfirmPwd: React.Dispatch<React.SetStateAction<string>>;
  setSignUpStep: React.Dispatch<
    React.SetStateAction<'email' | 'password' | 'profile' | 'permission'>
  >;
}
const SignUpPwdStep = ({
  pwd,
  setPwd,
  confirmPwd,
  setConfirmPwd,
  setSignUpStep,
}: SignUpEmailStepProps) => {
  const [isValidPwd, setIsValidPwd] = useState<boolean>(true); // true: 유효한 비밀번호 | 초기값, false: 유효하지 않은 비밀번호
  const [isValidConfirmPwd, setIsValidConfirmPwd] = useState<boolean>(true); // true: 일치 | 초기값, false: 불일치
  const [isNextStepAvailable, setIsNextStepAvailable] =
    useState<boolean>(false);

  const [showConfirmPwdInput, setShowConfirmPwdInput] =
    useState<boolean>(false); // 확인 비밀번호 입력창 노출 여부

  const [pwdErrorDescription, setPwdErrorDescription] = useState<string>(''); // 비밀번호 에러 메시지
  const [confirmPwdErrorDescription, setConfirmPwdErrorDescription] =
    useState<string>(''); // 확인 비밀번호 에러 메시지
  const [pwdSuccessDescription, setPwdSuccessDescription] =
    useState<string>(''); // 비밀번호 성공 메시지
  const [confirmPwdSuccessDescription, setConfirmPwdSuccessDescription] =
    useState<string>(''); // 확인 비밀번호 성공 메시지

  useEffect(() => {
    if (isValidPwd && isValidConfirmPwd && showConfirmPwdInput) {
      setIsNextStepAvailable(true);
    }
  }, [isValidPwd, isValidConfirmPwd, showConfirmPwdInput]);

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
      <View style={[tw('flex-col w-full flex'), { gap: 14 }]}>
        <View
          style={[
            tw('flex flex-col w-full'),
            { gap: 12 },
            !showConfirmPwdInput && { marginBottom: 100 },
          ]}
        >
          <Input
            type="password"
            placeholder="비밀번호를 입력하세요."
            value={pwd}
            onChangeText={setPwd}
            isValid={isValidPwd}
          />
          <View style={tw('w-full flex flex-row items-center justify-start')}>
            <Text
              style={[
                tw('font-primary-500'),
                { fontSize: 13 },
                isValidPwd ? tw('text-brand-primary') : tw('text-error'),
              ]}
            >
              {isValidPwd ? pwdSuccessDescription : pwdErrorDescription}
            </Text>
          </View>
        </View>
        {showConfirmPwdInput && (
          <View
            style={[tw('flex flex-col w-full'), { gap: 12, marginBottom: 100 }]}
          >
            <Input
              type="password"
              placeholder="비밀번호를 다시 한번 입력하세요."
              value={confirmPwd}
              onChangeText={setConfirmPwd}
              isValid={isValidConfirmPwd}
            />
            <View
              style={tw('w-full flex flex-row items-center justify-between')}
            >
              <Text
                style={[
                  tw('font-primary-500'),
                  { fontSize: 13 },
                  isValidPwd ? tw('text-brand-primary') : tw('text-error'),
                ]}
              >
                {isValidConfirmPwd
                  ? confirmPwdSuccessDescription
                  : confirmPwdErrorDescription}
              </Text>
              <RoundButton title="확인하기" onPress={() => {}} preset="sm" />
            </View>
          </View>
        )}
      </View>

      <SquareButton
        title="다음"
        onPress={() => setSignUpStep('profile')}
        disabled={isNextStepAvailable}
      />
    </View>
  );
};

export default SignUpPwdStep;
