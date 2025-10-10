import React from 'react';
import { View, Text } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import IconKcal from '@/shared/components/icons/IconKcal';

interface CalorieBadgeProps {
  value: number;
}

const CalorieBadge = ({ value }: CalorieBadgeProps) => (
  <View
    style={[
      tw('h-5 w-full flex-row justify-center items-center bg-brand-primary'),
      {
        maxWidth: 70,
        borderRadius: 20,
        paddingHorizontal: 13,
        paddingVertical: 4,
      },
    ]}
  >
    <IconKcal />
    <Text
      style={[
        tw('text-on-surface-secondary font-primary-500'),
        { fontSize: 10 },
      ]}
    >
      {value}kcal
    </Text>
  </View>
);

export default CalorieBadge;
