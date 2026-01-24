import React from 'react';
import { View, Text } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { IconTree } from '../icons';

interface TreeBadgeProps {
  value: number;
}

const TreeBadge = ({ value }: TreeBadgeProps) => (
  <View
    style={[
      tw('h-7 flex-row justify-center items-center bg-icon-container-primary'),
      {
        maxWidth: '70%',
        borderRadius: 20,
        paddingHorizontal: 11,
        paddingVertical: 6,
      },
    ]}
  >
    <IconTree />
    <Text
      style={[
        tw('text-on-surface-secondary font-primary-600 ml-0.5'),
        { fontSize: 13 },
      ]}
    >
      +{value}
    </Text>
  </View>
);

export default TreeBadge;
