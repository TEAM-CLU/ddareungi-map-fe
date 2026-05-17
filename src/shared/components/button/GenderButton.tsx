import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';

interface GenderButtonProps {
  title: string;
  selected: boolean;
  onPress: () => void;
}

const GenderButton = ({ title, selected, onPress }: GenderButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        tw(
          `justify-center items-center border ${
            selected ? 'border-brand-primary' : 'border-line-default'
          }`,
        ),
        {
          width: 91,
          height: 48,
          borderRadius: 26,
        },
      ]}
    >
      <Text
        style={[
          tw(
            `text-center  ${
              selected ? 'text-brand-primary' : 'text-on-surface-placeholder'
            }`,
          ),
          {
            fontSize: 15,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default GenderButton;
