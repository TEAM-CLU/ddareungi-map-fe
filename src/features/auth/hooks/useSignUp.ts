import { RootStackParamList } from '@/app/types';
import {
  CreateUserPayload,
  CreateUserResponse,
} from '@/features/auth/model/user.types';
import { UseMutateFunction } from '@tanstack/react-query';
import { StackNavigationProp } from 'node_modules/@react-navigation/stack/lib/typescript/src/types';
import { useState } from 'react';
import { Alert } from 'react-native';

interface UseSignUpParams {
  signUp: UseMutateFunction<
    CreateUserResponse,
    Error,
    CreateUserPayload,
    unknown
  >;
  navigation: StackNavigationProp<RootStackParamList>;
}

export const useSignUp = ({ signUp, navigation }: UseSignUpParams) => {
  const [signUpStep, setSignUpStep] = useState<1 | 2 | 3 | 4>(1);

  const [isConsentOptionalAgreed, setIsConsentOptionalAgreed] = useState(false);
  const [isConsentRequiredAgreed, setIsConsentRequiredAgreed] = useState(false);
  // 동의한 시각
  const [consentedAt, setConsentedAt] = useState<string | null>(null);
  const [isPrivacyConsentModalOpen, setIsPrivacyConsentModalOpen] =
    useState(true); // 개인정보 동의서 모달

  const [email, setEmail] = useState<string>('');
  const [pwd, setPwd] = useState<string>('');
  const [confirmPwd, setConfirmPwd] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [birthYear, setBirthYear] = useState<string>('');
  const [gender, setGender] = useState<'M' | 'F' | undefined>(undefined);
  const [address, setAddress] = useState<string | null>(null);

  const [isReadyToSignUp, setIsReadyToSignUp] = useState<boolean>(false);

  const handleSignUpPress = () => {
    if (
      !email ||
      !pwd ||
      !name ||
      (isConsentOptionalAgreed && (!birthYear || !gender || !address)) ||
      !isConsentRequiredAgreed ||
      !consentedAt
    ) {
      Alert.alert('오류', '모든 필수 정보를 입력해주세요.');
      setSignUpStep(1);
      setName('');
      setBirthYear('');
      setGender(undefined);
      setAddress(null);
      setPwd('');
      setConfirmPwd('');
      setEmail('');
      setIsConsentOptionalAgreed(false);
      setIsConsentRequiredAgreed(false);
      setConsentedAt(null);
      setIsReadyToSignUp(false);
      navigation.navigate('Login');
      return;
    }

    const payload: CreateUserPayload = {
      socialUid: null,
      email: email,
      password: pwd,
      name: name,
      gender: isConsentOptionalAgreed ? (gender ?? null) : null,
      birthYear: isConsentOptionalAgreed ? (birthYear || null) : null,
      address: isConsentOptionalAgreed ? (address || null) : null,
      consentedAt: consentedAt,
      requiredAgreed: isConsentRequiredAgreed,
      optionalAgreed: isConsentOptionalAgreed,
    };

    if (signUpStep === 4 && isReadyToSignUp) {
      signUp(payload, {
        onSuccess: data => {
          navigation.navigate('Login');
          Alert.alert('알림', data.message);
        },
        onError: error => {
          Alert.alert('오류', "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.");
          navigation.navigate('Login');
        },
      });
    }
  };

  const handleCancelPrivacyConsentPress = () => {
    navigation.navigate('Login');
    setIsPrivacyConsentModalOpen(false);
  };

  return {
    signUpStep,
    setSignUpStep,
    isConsentOptionalAgreed,
    setIsConsentOptionalAgreed,
    isConsentRequiredAgreed,
    setIsConsentRequiredAgreed,
    consentedAt,
    setConsentedAt,
    isPrivacyConsentModalOpen,
    setIsPrivacyConsentModalOpen,
    email,
    setEmail,
    pwd,
    setPwd,
    confirmPwd,
    setConfirmPwd,
    name,
    setName,
    birthYear,
    setBirthYear,
    gender,
    setGender,
    address,
    setAddress,
    isReadyToSignUp,
    setIsReadyToSignUp,
    handleSignUpPress,
    handleCancelPrivacyConsentPress,
  };
};
