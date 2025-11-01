import React, { use, useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Platform, Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { SafeAreaView } from 'react-native-safe-area-context';
import StepIndicator from '@/shared/components/StepIndicator';
import SignUpEmailStep from '@/features/auth/components/signUp/SignUpEmailStep';
import SignUpPwdStep from '@/features/auth/components/signUp/SignUpPwdStep';
import SignUpProfileStep from '@/features/auth/components/signUp/SignUpProfileStep';
import { TouchableWithoutFeedback } from 'react-native';
import SignUpPermissionStep from '@/features/auth/components/signUp/SignUpPermissionStep';
import { useCreateUserMutation } from '@/features/auth/services/user.queries';
import {
  CreateUserPayload,
  CreateUserResponse,
} from '@/features/auth/model/auth.types';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/app/types';
import RoundButton from '@/shared/components/button/RoundButton';
import IconBicycle from '@/shared/components/icons/IconBicycle';
import SimpleLoading from '@/shared/components/SimpleLoading';
import { useAuth } from '@/app/providers';
import axios from 'axios';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import SlideModal from '@/shared/components/modal/SlideModal';
import PrivacyConsentModal from '@/features/auth/components/PrivacyConsentModal';

const RegisterScreen = () => {
  const { mutateAsync: signUp } = useCreateUserMutation();
  const { setToken } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
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

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleSignUpButtonPress = async () => {
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
      try {
        const response: CreateUserResponse = await signUp(payload);
        Alert.alert('회원가입 성공', response.message);
        // 성공시
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
        navigation.navigate('Login');
      } catch (error) {
        if (axios.isAxiosError(error)) {
          Alert.alert(
            '오류',
            error.response?.data?.message ?? '회원가입 중 오류가 발생했습니다.',
          );
        }

        setSignUpStep(1);
        setEmail('');
        setPwd('');
        setConfirmPwd('');
        setName('');
        setBirthDate('');
        setGender(undefined);
        setAddress('');
        setIsReadyToSignUp(false);
        setIsConsentOptionalAgreed(false);
        setIsConsentRequiredAgreed(false);
        setConsentedAt(null);
        navigation.navigate('Login');
        return;
      }
    }
  };

  if (isLoading) return <SimpleLoading title="" />;

  if (isReadyToSignUp)
    return (
      <SafeAreaView
        style={[
          tw(
            'flex flex-1 bg-surface-secondary justify-between items-center pt-8',
          ),
          { paddingHorizontal: 36 },
        ]}
      >
        <View />
        <View
          style={[
            tw('flex w-full flex-row justify-center items-center'),
            { gap: 12 },
          ]}
        >
          <IconBicycle width={36} height={36} color="#01DA86" />
          <Text
            style={[
              tw('font-secondary text-on-surface-primary'),
              { fontSize: 30, lineHeight: 50 },
            ]}
          >
            환영합니다!
          </Text>
        </View>
        <RoundButton
          title="가입 완료"
          onPress={handleSignUpButtonPress}
          preset="lg"
        />
      </SafeAreaView>
    );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView
        style={[
          tw('flex flex-1 bg-surface-secondary pt-8 relative'),
          { paddingHorizontal: 36 },
        ]}
      >
        <StepIndicator totalSteps={4} currentStep={signUpStep} />
        {signUpStep === 1 ? (
          <SignUpEmailStep
            email={email}
            setEmail={setEmail}
            setSignUpStep={setSignUpStep}
          />
        ) : signUpStep === 2 ? (
          <SignUpPwdStep
            pwd={pwd}
            setPwd={setPwd}
            confirmPwd={confirmPwd}
            setConfirmPwd={setConfirmPwd}
            setSignUpStep={setSignUpStep}
          />
        ) : signUpStep === 3 ? (
          <SignUpProfileStep
            name={name}
            setName={setName}
            birthDate={birthDate}
            setBirthDate={setBirthDate}
            gender={gender}
            setGender={setGender}
            address={address}
            setAddress={setAddress}
            setSignUpStep={setSignUpStep}
            isConsentOptionalAgreed={isConsentOptionalAgreed}
          />
        ) : signUpStep === 4 ? (
          <SignUpPermissionStep setIsReadyToSignUp={setIsReadyToSignUp} />
        ) : (
          <SignUpEmailStep
            email={''}
            setEmail={setEmail}
            setSignUpStep={setSignUpStep}
          />
        )}
        <PrivacyConsentModal
          setIsPrivacyConsentModalOpen={setIsPrivacyConsentModalOpen}
          setIsConsentOptionalAgreed={setIsConsentOptionalAgreed}
          setIsConsentRequiredAgreed={setIsConsentRequiredAgreed}
          setConsentedAt={setConsentedAt}
          isPrivacyConsentModalOpen={isPrivacyConsentModalOpen}
          isConsentOptionalAgreed={isConsentOptionalAgreed}
          isConsentRequiredAgreed={isConsentRequiredAgreed}
          onCancel={() => {
            navigation.navigate('Login');
            setIsPrivacyConsentModalOpen(false);
          }}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default RegisterScreen;
