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
      { minWidth: 69, borderRadius: 20  },
    ]}
  >
    <Text
      style={[
        tw('text-on-surface-primary leading-6 mr-1'),
        { fontFamily: 'Pretendard-SemiBold', fontSize: 13 },
      ]}
    >
      🏃‍➡️
    </Text>
    <Text
      style={[
        tw('text-on-surface-primary leading-6'),
        { fontFamily: 'Pretendard-SemiBold', fontSize: 13 },
      ]}
    >
      {minutes}분
    </Text>
  </View>
);

export default WalkTimeBadge;
