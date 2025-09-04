import React from 'react';
import { Text, View } from 'react-native';
import {} from 'react-native-safe-area-context';
import { tw } from '@/shared/libs/tw-helper';

const MyPageScreen = () => {
  return (
    <View style={tw('flex-1 items-center justify-center bg-zinc-900')}>
      <Text style={tw('text-yellow-400 text-2xl font-bold')}>MyPage</Text>
    </View>
  );
};

export default MyPageScreen;
