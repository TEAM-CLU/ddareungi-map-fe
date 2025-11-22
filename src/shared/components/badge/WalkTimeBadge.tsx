import React from 'react';
import { View, Text } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import IconRun from '@/shared/components/icons/IconRun';

interface WalkTimeBadgeProps {
  minutes: number;
}

const WalkTimeBadge = ({ minutes }: WalkTimeBadgeProps) => (
  <View
    style={[
      tw('h-7 flex-row justify-center items-center bg-decorative-default'),
      {
        maxWidth: '70%',
        borderRadius: 20,
        paddingHorizontal: 13,
        paddingVertical: 6,
        gap: 4,
      },
    ]}
  >
    <IconRun color="#414548" width={17} height={18} />
    <Text
      style={[tw('text-on-surface-primary font-primary-600'), { fontSize: 13 }]}
    >
      {minutes}분
    </Text>
  </View>
);

export default WalkTimeBadge;
