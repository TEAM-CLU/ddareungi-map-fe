import React, { useState } from 'react';
import { Keyboard, Platform, Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { SafeAreaView } from 'react-native-safe-area-context';
import StepIndicator from '@/shared/components/StepIndicator';
import SignUpEmailStep from '@/features/auth/components/signUp/SignUpEmailStep';
import SignUpPwdStep from '@/features/auth/components/signUp/SignUpPwdStep';
import SignUpProfileStep from '@/features/auth/components/signUp/SignUpProfileStep';
import { TouchableWithoutFeedback } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';

const RegisterScreen = () => {
  const [signUpStep, setSignUpStep] = useState<1 | 2 | 3 | 4>(1);

  const [email, setEmail] = useState<string>('');
  const [pwd, setPwd] = useState<string>('');
  const [confirmPwd, setConfirmPwd] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [gender, setGender] = useState<'M' | 'F' | undefined>(undefined);
  const [address, setAddress] = useState<string>('');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView
        style={[
          tw('flex flex-1 bg-surface-secondary pt-8'),
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
          />
        ) : signUpStep === 4 ? (
          <View></View> // 만들 예정
        ) : (
          <SignUpEmailStep
            email={''}
            setEmail={setEmail}
            setSignUpStep={setSignUpStep}
          />
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default RegisterScreen;
