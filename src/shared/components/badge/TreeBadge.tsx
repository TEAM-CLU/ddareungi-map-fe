import React from 'react';
import { View, Text } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';

interface TreeBadgeProps {
  value: number;
}

const TreeBadge = ({ value }: TreeBadgeProps) => (
  <View
    style={[
      tw(
        'min-h-5 flex-row justify-center items-center bg-icon-container-primary',
      ),
      { minWidth: 44, borderRadius: 20 },
    ]}
  >
    <Text
      style={[
        tw('text-on-surface-secondary leading-6'),
        { fontFamily: 'Pretendard-Medium', fontSize: 10 },
      ]}
    >
      🌲
    </Text>
    <Text
      style={[
        tw('text-on-surface-secondary leading-6 ml-0.5'),
        { fontFamily: 'Pretendard-Medium', fontSize: 10 },
      ]}
    >
      +{value}
    </Text>
  </View>
);

export default TreeBadge;
