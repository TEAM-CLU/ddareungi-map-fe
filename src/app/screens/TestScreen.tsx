import React from 'react';
import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';

const TestScreen = () => {
  const [gender, setGender] = React.useState<'male' | 'female'>('male');

  return (
    <View style={tw('flex-1 items-center justify-center bg-surface-secondary')}>
      <Text>Test Screen</Text>
      <CalorieBadge value={143} />
    </View>
  );
};

export default TestScreen;
