import {
  CreateUserPayload,
  CreateUserResponse,
} from '@/features/auth/model/user.types';
import { UseMutateFunction } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert } from 'react-native';

interface UseSignUpParams {
  signUp: UseMutateFunction<
    CreateUserResponse,
    Error,
    CreateUserPayload,
    unknown
  >;
  navigation: any;
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
  const [birthDate, setBirthDate] = useState<string>('');
  const [gender, setGender] = useState<'M' | 'F' | undefined>(undefined);
  const [address, setAddress] = useState<string | null>(null);

  const [isReadyToSignUp, setIsReadyToSignUp] = useState<boolean>(false);

  const handleSignUpPress = () => {
    if (
      !email ||
      !pwd ||
      !name ||
      !birthDate ||
      !gender ||
      (!address && isConsentOptionalAgreed) ||
      !isConsentRequiredAgreed ||
      !consentedAt
    ) {
      Alert.alert('오류', '모든 필수 정보를 입력해주세요.');
      setSignUpStep(1);
      setName('');
      setBirthDate('');
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
      gender: gender,
      birthDate: birthDate,
      address: isConsentOptionalAgreed && address ? address : null,
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
          Alert.alert('오류', error.message);
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
    birthDate,
    setBirthDate,
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
