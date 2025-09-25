import React from 'react';
import { View, Text } from 'react-native';
import { tw } from '../libs/tw-helper';

interface NavigationDirectionProps {
  distance: string;
  direction: string;
}

const NavigationDirection = ({
  distance,
  direction,
}: NavigationDirectionProps) => {
  return (
    <View
      style={[
        tw('flex-row items-center justify-start bg-brand-primary'),
        {
          minWidth: 348,
          minHeight: 69,
          gap: 4,
          borderRadius: 20,
          paddingHorizontal: 20,
        },
      ]}
    >
      <Text
        style={[
          tw('text-on-surface-secondary mr-4'),
          { fontFamily: 'Pretendard-Bold', fontSize: 40 },
        ]}
      >
        ⬆
      </Text>
      <View style={[tw('flex-row items-center')]}>
        <Text
          style={[
            tw('text-on-surface-secondary'),
            {
              fontFamily: 'Pretendard-Bold',
              fontSize: 40,
            },
          ]}
        >
          {distance}
        </Text>
        <Text
          style={[
            tw('text-on-surface-secondary ml-3'),
            {
              fontFamily: 'Pretendard-SemiBold',
              fontSize: 40,
            },
          ]}
        >
          {direction}
        </Text>
      </View>
    </View>
  );
};

export default NavigationDirection;
