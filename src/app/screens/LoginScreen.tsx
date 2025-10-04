import React, { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import AuthChoice from '@/features/auth/components/AuthChoice';
import AuthGateway from '@/features/auth/components/AuthGateway';
import SimpleLoading from '@/shared/components/LoginLoading';

const LoginScreen = () => {
  const [loginScreenStep, setLoginScreenStep] = useState<'step1' | 'step2'>(
    'step1',
  );
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <SimpleLoading title="로그인 중..." />;
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={tw('flex flex-1 relative bg-surface-primary')}>
        {loginScreenStep === 'step1' ? (
          <AuthChoice setLoginScreenStep={setLoginScreenStep} />
        ) : loginScreenStep === 'step2' ? (
          <AuthGateway
            setIsLoading={setIsLoading}
            setLoginScreenStep={setLoginScreenStep}
          />
        ) : (
          <AuthChoice setLoginScreenStep={setLoginScreenStep} />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
