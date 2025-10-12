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
  CheckEmailPayload,
  CheckEmailResponse,
  SendVerificationEmailResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
} from '@/features/auth/model/auth.types';
import { useCheckEmailMutation } from '@/features/auth/services/user.queries';
import axios from 'axios';

interface SignUpEmailStepProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setSignUpStep: React.Dispatch<React.SetStateAction<1 | 2 | 3 | 4>>;
}
const SignUpEmailStep = ({
  email,
  setEmail,
  setSignUpStep,
}: SignUpEmailStepProps) => {
  const { mutateAsync: checkEmailRedundancy } = useCheckEmailMutation();
  const { mutateAsync: sendVerificationCode } =
    useSendVerificationEmailMutation();
  const { mutateAsync: verifyCode } = useVerifyEmailMutation();

  const [code, setCode] = useState<string>('');
  const [isValidEmail, setIsValidEmail] = useState<boolean>(true); // true: 유효한 이메일 | 초기값, false: 유효하지 않은 이메일
  const [isValidCode, setIsValidCode] = useState<boolean>(true); // true: 유효한 코드 | 초기값, false: 유효하지 않은 코드
  const [isNextStepAvailable, setIsNextStepAvailable] =
    useState<boolean>(false);

  const [showCodeInput, setShowCodeInput] = useState<boolean>(false); // 인증코드 입력창 노출 여부

  const [emailErrorDescription, setEmailErrorDescription] =
    useState<string>(''); // 이메일 에러 메시지
  const [codeErrorDescription, setCodeErrorDescription] = useState<string>(''); // 인증코드 에러 메시지
  const [emailSuccessDescription, setEmailSuccessDescription] =
    useState<string>(''); // 이메일 성공 메시지
  const [codeSuccessDescription, setCodeSuccessDescription] =
    useState<string>(''); // 인증코드 성공 메시지

  const [canGoNextStep, setCanGoNextStep] = useState(false); // 다음 단계로 넘어갈 수 있는지 여부

  // 이메일 중복 확인
  const handleCheckEmailRedundancyButtonPress = async () => {
    //이메일 입력 확인
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
    const payload: CheckEmailPayload = { email: email };

    // 중복확인
    try {
      const response: CheckEmailResponse = await checkEmailRedundancy(payload);

      // 사용 가능한 이메일인 경우
      setEmailErrorDescription('');
      setIsValidEmail(true);
      setEmailSuccessDescription(`${response.message}`);
      // 인증 코드 전송
      try {
        const response: SendVerificationEmailResponse =
          await sendVerificationCode(payload);

        Alert.alert('인증 코드가 전송되었습니다.'); // 한번더 강조
        setIsValidEmail(true);
        setIsValidCode(true);
        setShowCodeInput(true);
        setCodeErrorDescription('');
        setCodeSuccessDescription(`${response.message}`);
      } catch (error) {
        // 네트워크 또는 서버 오류 처리
        setCodeSuccessDescription('');
        if (axios.isAxiosError(error)) {
          setCodeErrorDescription(
            `${
              error.response?.data?.message ?? '요청 실패. 다시 시도해주세요.'
            }`,
          );
        }
      }
    } catch (error) {
      // 네트워크 또는 서버 오류 처리
      setEmailSuccessDescription('');
      setIsValidEmail(false);
      if (axios.isAxiosError(error)) {
        setEmailErrorDescription(
          `${error.response?.data?.message ?? '요청 실패. 다시 시도해주세요.'}`,
        );
      }
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

    // 6자리 검증 추가
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

      // 유효한 인증코드인 경우
      setCodeErrorDescription('');
      setIsValidCode(true);
      setCodeSuccessDescription(`${response.message}`);
      setCanGoNextStep(true);
    } catch (error) {
      // 네트워크 또는 서버 오류 처리
      setCodeSuccessDescription('');
      setIsValidCode(false);
      if (axios.isAxiosError(error)) {
        setCodeErrorDescription(
          `${error.response?.data?.message ?? '요청 실패. 다시 시도해주세요.'}`,
        );
      }
      return;
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
              title={showCodeInput ? '재전송' : '중복확인'}
              onPress={handleCheckEmailRedundancyButtonPress}
              preset="sm"
            />
          </View>
        </View>
        {showCodeInput && (
          <View
            style={[tw('flex flex-col w-full'), { gap: 12, marginBottom: 100 }]}
          >
            {/* step2: 인증코드 검사 */}
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
        onPress={() => setSignUpStep(2)}
        disabled={!isNextStepAvailable}
      />
    </View>
  );
};

export default SignUpEmailStep;
