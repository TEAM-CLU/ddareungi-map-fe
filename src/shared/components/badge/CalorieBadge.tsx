import React from 'react';
import { View, Text } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';

interface CalorieBadgeProps {
  value: number;
}

const CalorieBadge = ({ value }: CalorieBadgeProps) => (
  <View
    style={[
      tw('min-h-5 flex-row justify-center items-center bg-brand-primary'),
      { minWidth: 70, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 4 },
    ]}
  >
    <Text
      style={[
        tw('text-on-surface-secondary leading-6 mr-1'),
        { fontFamily: 'Pretendard-Medium', fontSize: 10 },
      ]}
    >
      🔥
    </Text>
    <Text
      style={[
        tw('text-on-surface-secondary leading-6'),
        { fontFamily: 'Pretendard-Medium', fontSize: 10 },
      ]}
    >
      {value}kcal
    </Text>
  </View>
);

export default CalorieBadge;
