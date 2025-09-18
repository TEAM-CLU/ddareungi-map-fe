import { tw } from '@/shared/libs/tw-helper';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface RoundButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

const RoundButton = ({
  title,
  onPress,
  disabled = false,
}: RoundButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        tw('justify-center items-center bg-brand-primary'),
        {
          width: 264,
          height: 42,
          borderRadius: 20,
        },
      ]}
    >
      <Text
        style={[
          tw('text-on-surface-secondary text-center text-base'),
          {
            fontFamily: 'Pretendard-Bold',
            lineHeight: 42,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default RoundButton;

