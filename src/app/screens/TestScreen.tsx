import React from 'react';
import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';
import TreeBadge from '@/shared/components/badge/TreeBadge';
import WalkTimeBadge from '@/shared/components/badge/WalkTimeBadge';

const TestScreen = () => {
  const [gender, setGender] = React.useState<'male' | 'female'>('male');

  return (
    <View
      style={[tw(
        'flex-1 flex-col items-center justify-center bg-surface-secondary',
      ), { gap: 8 }]}
    >
      <View style={[tw('flex-row'), { gap: 8 }]}>
        <CalorieBadge value={143} />
        <TreeBadge value={5} />
      </View>
      <View style={[tw('flex-col'), { gap: 8 }]}>
        <WalkTimeBadge minutes={15} />
      </View>
    </View>
  );
};

export default TestScreen;
