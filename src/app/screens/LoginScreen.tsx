import React from 'react';
import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';

const LoginScreen = () => {
  return (
    <View style={tw('flex-1 items-center justify-center bg-zinc-900')}>
      <Text style={tw('text-yellow-400 text-2xl font-bold')}>Login</Text>
    </View>
  );
};

export default LoginScreen;
