import React from 'react';
import { View, Text } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';

interface WalkTimeBadgeProps {
  minutes: number;
}

const WalkTimeBadge = ({ minutes }: WalkTimeBadgeProps) => (
  <View
    style={[
      tw(
        'min-h-6 flex-row justify-center items-center bg-decorative-default',
      ),
      { minWidth: 69, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 6 },
    ]}
  >
    <Text
      style={[
        tw('text-on-surface-primary font-primary-600 leading-6 mr-1'),
        { fontSize: 13 },
      ]}
    >
      🏃‍➡️
    </Text>
    <Text
      style={[
        tw('text-on-surface-primary font-primary-600 leading-6'),
        { fontSize: 13 },
      ]}
    >
      {minutes}분
    </Text>
  </View>
);

export default WalkTimeBadge;
