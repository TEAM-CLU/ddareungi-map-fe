import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { SafeAreaView } from 'react-native-safe-area-context';
import StepIndicator from '@/features/auth/components/signUp/StepIndicator';
import SignUpEmailStep from '@/features/auth/components/signUp/SignUpEmailStep';
import SignUpPwdStep from '@/features/auth/components/signUp/SignUpProfileStep';
import SignUpProfileStep from '@/features/auth/components/signUp/SignUpPwdStep';

const RegisterScreen = () => {
  const [signUpStep, setSignUpStep] = useState<
    'email' | 'password' | 'profile'
  >('email');

  const [email, setEmail] = useState<string>('');
  const [pwd, setPwd] = useState<string>('');
  const [confirmPwd, setConfirmPwd] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | undefined>(
    undefined,
  );
  const [address, setAddress] = useState<string>('');
  return (
    <SafeAreaView
      style={[
        tw('flex flex-1 bg-surface-secondary mt-8'),
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
          signUpStep={signUpStep}
        />
      ) : (
        <SignUpEmailStep
          email={''}
          setEmail={function (value: React.SetStateAction<string>): void {
            throw new Error('Function not implemented.');
          }}
          setSignUpStep={function (
            value: React.SetStateAction<'email' | 'password' | 'profile'>,
          ): void {
            throw new Error('Function not implemented.');
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default RegisterScreen;
