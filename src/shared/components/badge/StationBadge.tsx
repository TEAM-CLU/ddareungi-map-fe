import React from 'react';
import { View, Text } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';

interface StationBadgeProps {
  name: string;
}

const StationBadge = ({ name }: StationBadgeProps) => (
  <View
    style={[
      tw('min-h-6 flex-row justify-center items-center bg-brand-primary'),
      { borderRadius: 20, paddingHorizontal: 13, paddingVertical: 6 },
    ]}
  >
    <Text
      style={[
        tw('text-on-surface-secondary font-primary-600 leading-6 mr-1'),
        { fontSize: 13 },
      ]}
    >
      🚲
    </Text>
    <Text
      style={[
        tw('text-on-surface-secondary font-primary-600 leading-6'),
        { fontSize: 13 },
      ]}
    >
      {name}
    </Text>
  </View>
);

export default StationBadge;
