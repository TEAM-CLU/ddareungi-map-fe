import React, { useEffect, useState } from 'react';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import AuthChoice from '@/features/auth/components/AuthChoice';
import AuthGateway from '@/features/auth/components/AuthGateway';
import SimpleLoading from '@/shared/components/SimpleLoading';
import { useBlockBackNavigation } from '@/shared/hooks/useBlockBackNavigation';

const LoginScreen = () => {
  const [loginScreenStep, setLoginScreenStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);

  useBlockBackNavigation(true);

  // 1분뒤 로딩 자동종료
  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        setIsLoading(false);
      }, 60000);
    }
  }, [isLoading]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={tw('flex flex-1 relative bg-surface-primary')}>
        {loginScreenStep === 1 ? (
          <AuthChoice setLoginScreenStep={setLoginScreenStep} />
        ) : loginScreenStep === 2 ? (
          <AuthGateway setLoginScreenStep={setLoginScreenStep} />
        ) : (
          <AuthChoice setLoginScreenStep={setLoginScreenStep} />
        )}
        {isLoading && <SimpleLoading title="로그인 중..." />}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
