import React, { useState } from 'react';
import {
  Image,
  ImageStyle,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import LinearGradient from 'react-native-linear-gradient';
import RoundButton from '@/shared/components/button/RoundButton';
import AuthChoice from '@/features/auth/components/AuthChoice';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconClose from '@/shared/components/icons/IconClose';
import SquareButton from '@/shared/components/button/SquareButton';
import Input from '@/shared/components/Input/Input';
import AuthGateway from '@/features/auth/components/AuthGateway';
import { KeyboardAvoidingView } from 'react-native';

const LoginScreen = () => {
  const [loginScreenStep, setLoginScreenStep] = useState<1 | 2>(
    1,
  );
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
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
