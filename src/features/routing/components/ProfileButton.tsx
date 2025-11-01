import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';

interface ProfileButtonProps {
  title: string;
  selected: boolean;
  onPress: () => void;
}

const ProfileButton = ({ title, selected, onPress }: ProfileButtonProps) => {
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
          width: 61,
          height: 35,
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
            fontSize: 14,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default ProfileButton;
