import Input from '@/shared/components/Input/Input';
import { useEffect, useState } from 'react';
import { tw } from '@/shared/libs/tw-helper';
import { Alert, Text, View } from 'react-native';
import SquareButton from '@/shared/components/button/SquareButton';
import RoundButton from '@/shared/components/button/RoundButton';
import {
  useSendVerificationEmailMutation,
  useVerifyEmailMutation,
} from '@/features/auth/services/auth.queries';
import {
  SendVerificationEmailResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
} from '@/features/auth/model/auth.types';

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
  const { mutateAsync: sendVerificationCode } =
    useSendVerificationEmailMutation();
  const { mutateAsync: verifyCode } = useVerifyEmailMutation();

  const [code, setCode] = useState<string>('');
  const [isValidEmail, setIsValidEmail] = useState<boolean>(true);
  const [isValidCode, setIsValidCode] = useState<boolean>(true);
  const [isNextStepAvailable, setIsNextStepAvailable] =
    useState<boolean>(false);

  const [showCodeInput, setShowCodeInput] = useState<boolean>(false);

  const [emailErrorDescription, setEmailErrorDescription] =
    useState<string>('');
  const [codeErrorDescription, setCodeErrorDescription] = useState<string>('');
  const [emailSuccessDescription, setEmailSuccessDescription] =
    useState<string>('');
  const [codeSuccessDescription, setCodeSuccessDescription] =
    useState<string>('');

  const [canGoNextStep, setCanGoNextStep] = useState(false);

  // 이메일 양식 확인 후 바로 코드 전송
  const handleSendCodeButtonPress = async () => {
    // 이메일 입력 확인
    if (email.trim() === '') {
      setEmailSuccessDescription('');
      setIsValidEmail(false);
      setEmailErrorDescription('이메일을 입력해주세요.');
      return;
    }

    // 이메일 형식 확인
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailSuccessDescription('');
      setIsValidEmail(false);
      setEmailErrorDescription('올바른 이메일 형식이 아닙니다.');
      return;
    }

    // payload 생성
    const payload = { email: email };

    // 이메일 형식이 올바르면 코드 전송
    try {
      const response: SendVerificationEmailResponse =
        await sendVerificationCode(payload);

      if ('statusCode' in response) {
        setCodeSuccessDescription('');
        setCodeErrorDescription(`${response.message}`);
        return;
      }

      // 성공 시
      Alert.alert('인증 코드가 전송되었습니다.');
      setIsValidEmail(true);
      setIsValidCode(true);
      setShowCodeInput(true);
      setEmailErrorDescription('');
      setCodeSuccessDescription(`${response.message}`);
    } catch (_) {
      // 네트워크 또는 서버 오류 처리
      setCodeSuccessDescription('');
      setCodeErrorDescription('인증 코드 전송 실패. 다시 시도해주세요.');
    }
  };

  const handleVerifyCodeButtonPress = async () => {
    // 이메일 입력 재확인
    if (email.trim() === '') {
      setEmailSuccessDescription('');
      setIsValidEmail(false);
      setEmailErrorDescription('이메일을 입력해주세요.');
      return;
    } else {
      setEmailErrorDescription('');
      setIsValidEmail(true);
      setEmailSuccessDescription('');
    }

    // 이메일 형식 재확인
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailSuccessDescription('');
      setIsValidEmail(false);
      setEmailErrorDescription('올바른 이메일 형식이 아닙니다.');
      return;
    } else {
      setEmailErrorDescription('');
      setIsValidEmail(true);
      setEmailSuccessDescription('');
    }

    // 인증코드 입력 확인
    if (code.trim() === '') {
      setCodeSuccessDescription('');
      setIsValidCode(false);
      setCodeErrorDescription('인증 코드를 입력해주세요.');
      return;
    }

    // 인증코드 형식 확인 (숫자만 허용)
    const codeRegex = /^\d+$/;
    if (!codeRegex.test(code)) {
      setCodeSuccessDescription('');
      setIsValidCode(false);
      setCodeErrorDescription('숫자만 입력 가능합니다.');
      return;
    }

    // 6자리 검증
    if (code.length !== 6) {
      setCodeSuccessDescription('');
      setIsValidCode(false);
      setCodeErrorDescription('인증 코드는 6자리여야 합니다.');
      return;
    }

    // payload 생성
    const payload: VerifyEmailPayload = {
      email: email,
      verificationCode: code,
    };

    // 인증코드 확인
    try {
      const response: VerifyEmailResponse = await verifyCode(payload);

      if ('statusCode' in response) {
        setCodeSuccessDescription('');
        setIsValidCode(false);
        setCodeErrorDescription(`${response.message}`);
        return;
      }

      setCodeErrorDescription('');
      setIsValidCode(true);
      setCodeSuccessDescription(`${response.message}`);
      setCanGoNextStep(true);
    } catch (error) {
      setCodeSuccessDescription('');
      setIsValidCode(false);
      setCodeErrorDescription('인증 코드 확인 실패. 다시 시도해주세요.');
    }
  };

  // 다음 단계 버튼 활성화 로직
  useEffect(() => {
    const canProceed =
      isValidCode &&
      isValidEmail &&
      showCodeInput &&
      !!email &&
      !!code &&
      canGoNextStep;

    // 기존에는 버튼을 눌러야만 isValid가 바뀌었다면, 지금은 상태값이 바뀌면 자동으로 버튼 disabled 상태가 바뀌도록
    setIsNextStepAvailable(canProceed);
  }, [isValidCode, isValidEmail, showCodeInput, email, code, canGoNextStep]);

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
      <View style={[tw('flex-col w-full flex'), { gap: 14 }]}>
        <View
          style={[
            tw('flex flex-col w-full'),
            { gap: 12 },
            !showCodeInput && { marginBottom: 100 },
          ]}
        >
          <Input
            type="text"
            placeholder="이메일을 입력하세요."
            value={email}
            onChangeText={setEmail}
            isValid={isValidEmail}
          />
          <View style={tw('w-full flex flex-row items-center justify-between')}>
            <Text
              style={[
                tw('font-primary-500'),
                { fontSize: 13 },
                isValidEmail ? tw('text-brand-primary') : tw('text-error'),
              ]}
            >
              {isValidEmail ? emailSuccessDescription : emailErrorDescription}
            </Text>
            <RoundButton
              title={showCodeInput ? '재전송' : '코드전송'}
              onPress={handleSendCodeButtonPress}
              preset="sm"
            />
          </View>
        </View>
        {showCodeInput && (
          <View
            style={[tw('flex flex-col w-full'), { gap: 12, marginBottom: 100 }]}
          >
            <Input
              type="number"
              placeholder="인증 코드를 입력하세요."
              value={code}
              onChangeText={setCode}
              isValid={isValidCode}
            />
            <View
              style={tw('w-full flex flex-row items-center justify-between')}
            >
              <Text
                style={[
                  tw('font-primary-500'),
                  { fontSize: 13 },
                  isValidCode ? tw('text-brand-primary') : tw('text-error'),
                ]}
              >
                {isValidCode ? codeSuccessDescription : codeErrorDescription}
              </Text>
              <RoundButton
                title="코드확인"
                onPress={handleVerifyCodeButtonPress}
                preset="sm"
              />
            </View>
          </View>
        )}
      </View>
      <SquareButton
        title="다음"
        onPress={() => setPwdResetStep(2)}
        disabled={!isNextStepAvailable}
      />
    </View>
  );
};

export default PwdResetVerifyEmailStep;
