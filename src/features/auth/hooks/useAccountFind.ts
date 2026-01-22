import {
  FindAccountPayload,
  FindAccountResponse,
  SendVerificationEmailPayload,
  SendVerificationEmailResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
} from '@/features/auth/model/auth.types';
import { AccountFeatureType } from '@/features/auth/model/common.types';
import { UseMutateFunction } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';

interface UseAccountFindParams {
  sendVerificationCode: UseMutateFunction<
    SendVerificationEmailResponse,
    Error,
    SendVerificationEmailPayload,
    unknown
  >;
  verifyCode: UseMutateFunction<
    VerifyEmailResponse,
    Error,
    VerifyEmailPayload,
    unknown
  >;
  findAccount: UseMutateFunction<
    FindAccountResponse,
    Error,
    FindAccountPayload,
    unknown
  >;
  setAccountFeatures: React.Dispatch<React.SetStateAction<AccountFeatureType>>;
}

export const useAccountFind = ({
  sendVerificationCode,
  verifyCode,
  findAccount,
  setAccountFeatures,
}: UseAccountFindParams) => {
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [isValidEmail, setIsValidEmail] = useState<boolean>(true);
  const [isValidCode, setIsValidCode] = useState<boolean>(true);
  const [canShowRegistrationInfo, setCanShowRegistrationInfo] =
    useState<boolean>(false);

  const [showCodeInput, setShowCodeInput] = useState<boolean>(false);

  const [emailErrorDescription, setEmailErrorDescription] =
    useState<string>('');
  const [codeErrorDescription, setCodeErrorDescription] = useState<string>('');
  const [emailSuccessDescription, setEmailSuccessDescription] =
    useState<string>('');
  const [codeSuccessDescription, setCodeSuccessDescription] =
    useState<string>('');

  const securityToken = useRef<string>('');
  const [showRegistrationInfo, setShowRegistrationInfo] =
    useState<boolean>(false);
  const [registrationInfoMessage, setRegistrationInfoMessage] = useState<
    string[]
  >([]);
  const [accountType, setAccountType] = useState<'소셜' | '자체' | null>(null);

  const handleClosePress = () => setAccountFeatures(null);

  // 이메일 양식 확인 후 바로 코드 전송
  const handleSendCodePress = () => {
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
    sendVerificationCode(payload, {
      onSuccess: data => {
        setIsValidEmail(true);
        setIsValidCode(true);
        setShowCodeInput(true);
        setEmailErrorDescription('');
        setCodeSuccessDescription(data.message);
      },
      onError: error => {
        setCodeSuccessDescription('');
        setCodeErrorDescription(error.message);
      },
    });
  };

  const handleVerifyCodePress = async () => {
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
    verifyCode(payload, {
      onSuccess: response => {
        setCodeErrorDescription('');
        setIsValidCode(true);
        setCodeSuccessDescription(response.message);
        setCanShowRegistrationInfo(true);
        securityToken.current = response.data.securityToken;
      },
      onError: error => {
        setCodeSuccessDescription('');
        setIsValidCode(false);
        setCodeErrorDescription(error.message);
      },
    });
  };

  const handleQueryRegistrationInfoPress = () => {
    if (!securityToken.current) {
      Alert.alert('요청 실패. 다시 시도해주세요.');
      setAccountFeatures(null);
      return;
    }

    const payload = {
      securityToken: securityToken.current,
    };

    findAccount(payload, {
      onSuccess: response => {
        const sentences = response.message.split('.');
        setRegistrationInfoMessage(sentences);
        setAccountType(response.data.accountType);
        setShowRegistrationInfo(true);
      },
      onError: error => {
        Alert.alert('요청 실패', error.message);
      },
    });
  };

  return {
    email,
    setEmail,
    code,
    setCode,
    isValidEmail,
    setIsValidEmail,
    isValidCode,
    setIsValidCode,
    canShowRegistrationInfo,
    setCanShowRegistrationInfo,
    showCodeInput,
    setShowCodeInput,
    emailErrorDescription,
    setEmailErrorDescription,
    codeErrorDescription,
    setCodeErrorDescription,
    emailSuccessDescription,
    setEmailSuccessDescription,
    codeSuccessDescription,
    setCodeSuccessDescription,
    securityToken,
    showRegistrationInfo,
    setShowRegistrationInfo,
    registrationInfoMessage,
    setRegistrationInfoMessage,
    accountType,
    setAccountType,
    handleClosePress,
    handleSendCodePress,
    handleVerifyCodePress,
    handleQueryRegistrationInfoPress,
  };
};
