import React from 'react';
import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import RoundButton from '@/shared/components/button/RoundButton';
import SquareButton from '@/shared/components/button/SquareButton';

const TestScreen = () => {
  return (
    <View style={tw('flex-1 items-center justify-center')}>
      <SquareButton title="스퀘어 버튼" onPress={() => {}} />
      <View style={tw('h-4')} />
      <RoundButton title="라운드 버튼" onPress={() => {}} />
    </View>
  );
};

export default TestScreen;
