import React from 'react';
import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';
import TreeBadge from '@/shared/components/badge/TreeBadge';
import WalkTimeBadge from '@/shared/components/badge/WalkTimeBadge';
import StationBadge from '@/shared/components/badge/StationBadge';

const TestScreen = () => {
  const [gender, setGender] = React.useState<'male' | 'female'>('male');

  return (
    <View
      style={[
        tw('flex-1 flex-col items-center justify-center bg-surface-secondary'),
        { gap: 8 },
      ]}
    >
      <View style={[tw('flex-row'), { gap: 8 }]}>
        <CalorieBadge value={143} />
        <TreeBadge value={5} />
      </View>

      <View style={[tw('flex-col items-start'), { gap: 8 }]}>
        <View style={{ gap: 8 }}>
          <WalkTimeBadge minutes={15} />
        </View>
        <StationBadge name="1600. 과기대 입구" />
        <StationBadge name="24. 붕어방" />
      </View>
    </View>
  );
};

export default TestScreen;
