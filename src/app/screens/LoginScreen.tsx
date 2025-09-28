import React, { useState } from 'react';
import { Image, ImageStyle, Text, TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import LinearGradient from 'react-native-linear-gradient';
import RoundButton from '@/shared/components/button/RoundButton';
import AuthChoice from '@/features/auth/components/AuthChoice';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconClose from '@/shared/components/icons/IconClose';
import SquareButton from '@/shared/components/button/SquareButton';
import Input from '@/shared/components/Input/Input';
import AuthGateway from '@/features/auth/components/AuthGateway';

const LoginScreen = () => {
  const [loginScreenStep, setLoginScreenStep] = useState<'step1' | 'step2'>(
    'step1',
  );
  return (
    <View style={tw('flex flex-1 relative bg-surface-primary')}>
      {loginScreenStep === 'step1' ? (
        <AuthChoice setLoginScreenStep={setLoginScreenStep} />
      ) : loginScreenStep === 'step2' ? (
        <AuthGateway setLoginScreenStep={setLoginScreenStep} />
      ) : (
        <AuthChoice setLoginScreenStep={setLoginScreenStep} />
      )}
    </View>
  );
};

export default LoginScreen;
