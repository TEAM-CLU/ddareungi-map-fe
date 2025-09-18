import React from 'react';
import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';
import TreeBadge from '@/shared/components/badge/TreeBadge';
import WalkTimeBadge from '@/shared/components/badge/WalkTimeBadge';
import StationBadge from '@/shared/components/badge/StationBadge';
import NavigationDirection from '@/shared/components/NavigationDirection';

const TestScreen = () => {
  const [gender, setGender] = React.useState<'male' | 'female'>('male');

  return (
    <View
      style={[
        tw('flex-1 flex-col items-center justify-center bg-surface-secondary'),
        { gap: 8 },
      ]}
    >
      <NavigationDirection distance="1.2km" direction="우회전" />
      <NavigationDirection distance="200m" direction="직진" />
    </View>
  );
};

export default TestScreen;
