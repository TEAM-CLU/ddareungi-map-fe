import React from 'react';
import { View, Text } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import IconTree from '@/shared/components/icons/IconTree';

interface TreeBadgeProps {
  value: number;
}

const TreeBadge = ({ value }: TreeBadgeProps) => (
  <View
    style={[
      tw(
        'h-5 w-full flex-row justify-center items-center bg-icon-container-primary',
      ),
      {
        maxWidth: 44,
        borderRadius: 20,
        paddingHorizontal: 11,
        paddingVertical: 4,
      },
    ]}
  >
    <IconTree />
    <Text
      style={[
        tw('text-on-surface-secondary font-primary-500 ml-0.5'),
        { fontSize: 10 },
      ]}
    >
      +{value}
    </Text>
  </View>
);

export default TreeBadge;
