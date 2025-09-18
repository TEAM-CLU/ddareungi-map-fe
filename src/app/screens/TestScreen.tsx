import React from 'react';
import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';
import TreeBadge from '@/shared/components/badge/TreeBadge';

const TestScreen = () => {
  const [gender, setGender] = React.useState<'male' | 'female'>('male');

  return (
    <View style={tw('flex-1 items-center justify-center bg-surface-secondary')}>
      <View style={[tw('flex-row'), { gap: 8 }]}>
        <CalorieBadge value={143} />
        <TreeBadge value={5} />
      </View>
    </View>
  );
};

export default TestScreen;
