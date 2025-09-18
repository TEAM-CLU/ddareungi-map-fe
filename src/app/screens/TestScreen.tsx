import React from 'react';
import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import RoundButton from '@/shared/components/button/RoundButton';
import SquareButton from '@/shared/components/button/SquareButton';
import GenderButton from '@/shared/components/button/GenderButton';

const TestScreen = () => {
  const [gender, setGender] = React.useState<'male' | 'female'>('male');

  return (
    <View style={tw('flex-1 items-center justify-center bg-surface-secondary')}>
      <SquareButton title="스퀘어 버튼" onPress={() => {}} />
      <View style={tw('h-4')} />
      <RoundButton preset="lg" title="라운드 버튼" onPress={() => {}} />
      <RoundButton preset="sm" title="인증하기" onPress={() => {}} />
      <RoundButton preset="origin" title="출발" onPress={() => {}} />
      <RoundButton preset="destination" title="도착" onPress={() => {}} />
      <RoundButton preset="destination" title="반환점" onPress={() => {}} />
      <View style={tw('h-4')} />
      <View style={tw('flex-row')}>
        <GenderButton
          label="남성"
          selected={gender === 'male'}
          onPress={() => setGender('male')}
        />
        <GenderButton
          label="여성"
          selected={gender === 'female'}
          onPress={() => setGender('female')}
        />
      </View>
    </View>
  );
};

export default TestScreen;
