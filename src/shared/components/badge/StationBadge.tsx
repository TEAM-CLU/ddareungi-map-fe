import React from 'react';
import { View, Text } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import IconBicycle from '@/shared/components/icons/IconBicycle';

interface StationBadgeProps {
  name: string;
}

const StationBadge = ({ name }: StationBadgeProps) => (
  <View
    style={[
      tw('h-6 flex-row justify-center items-center bg-brand-primary w-full'),
      {
        borderRadius: 20,
        paddingHorizontal: 13,
        paddingVertical: 4,
        maxWidth: 144,
        gap: 6,
      },
    ]}
  >
    <IconBicycle />
    <Text
      style={[
        tw('text-on-surface-secondary font-primary-600'),
        { fontSize: 13 },
      ]}
    >
      {name}
    </Text>
  </View>
);

export default StationBadge;
