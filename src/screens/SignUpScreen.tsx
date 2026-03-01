import React from 'react';
import { Keyboard, Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { SafeAreaView } from 'react-native-safe-area-context';
import StepIndicator from '@/shared/components/StepIndicator';
import SignUpEmailStep from '@/features/auth/components/signUp/SignUpEmailStep';
import SignUpPwdStep from '@/features/auth/components/signUp/SignUpPwdStep';
import SignUpProfileStep from '@/features/auth/components/signUp/SignUpProfileStep';
import { TouchableWithoutFeedback } from 'react-native';
import SignUpPermissionStep from '@/features/auth/components/signUp/SignUpPermissionStep';
import { useCreateUserMutation } from '@/features/auth/services/user.queries';
import RoundButton from '@/shared/components/button/RoundButton';
import SimpleLoading from '@/shared/components/SimpleLoading';
import PrivacyConsentModal from '@/features/auth/components/PrivacyConsentModal';
import { useBlockBackNavigation } from '@/shared/hooks/useBlockBackNavigation';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import { useSignUp } from '@/features/auth/hooks/useSignUp';
import { IconBicycle } from '@/shared/components/icons';

const SignUpScreen = () => {
  const { mutate: signUp, isPending } = useCreateUserMutation();
  const { navigation } = useAppNavigation();

  useBlockBackNavigation(true);

  const {
    signUpStep,
    setSignUpStep,
    isConsentOptionalAgreed,
    setIsConsentOptionalAgreed,
    isConsentRequiredAgreed,
    setIsConsentRequiredAgreed,
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
    setBirthYear,
    gender,
    setGender,
    setAddress,
    isReadyToSignUp,
    setIsReadyToSignUp,
    handleSignUpPress,
    handleCancelPrivacyConsentPress,
  } = useSignUp({ signUp, navigation });

  if (isPending) return <SimpleLoading title="회원가입 중" />;

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
          onPress={handleSignUpPress}
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
            setBirthYear={setBirthYear}
            gender={gender}
            setGender={setGender}
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
          onCancel={handleCancelPrivacyConsentPress}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default SignUpScreen;
