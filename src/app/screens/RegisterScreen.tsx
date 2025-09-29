import React, { useState } from 'react';
import { Keyboard, Platform, Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { SafeAreaView } from 'react-native-safe-area-context';
import StepIndicator from '@/features/auth/components/signUp/StepIndicator';
import SignUpEmailStep from '@/features/auth/components/signUp/SignUpEmailStep';
import SignUpPwdStep from '@/features/auth/components/signUp/SignUpPwdStep';
import SignUpProfileStep from '@/features/auth/components/signUp/SignUpProfileStep';
import { TouchableWithoutFeedback } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';

const RegisterScreen = () => {
  const [signUpStep, setSignUpStep] = useState<
    'email' | 'password' | 'profile' | 'finish'
  >('email');

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
        <StepIndicator step={signUpStep} />
        {signUpStep === 'email' ? (
          <SignUpEmailStep
            email={email}
            setEmail={setEmail}
            setSignUpStep={setSignUpStep}
          />
        ) : signUpStep === 'password' ? (
          <SignUpPwdStep
            pwd={pwd}
            setPwd={setPwd}
            confirmPwd={confirmPwd}
            setConfirmPwd={setConfirmPwd}
            setSignUpStep={setSignUpStep}
          />
        ) : signUpStep === 'profile' ? (
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
        ) : (
          <SignUpEmailStep
            email={''}
            setEmail={function (value: React.SetStateAction<string>): void {
              throw new Error('Function not implemented.');
            }}
            setSignUpStep={setSignUpStep}
          />
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default RegisterScreen;
