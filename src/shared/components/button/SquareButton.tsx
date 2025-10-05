import { tw } from '@/shared/libs/tw-helper';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface SquareButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

const SquareButton = ({
  title,
  onPress,
  disabled = false,
}: SquareButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        tw('justify-center items-center'),
        disabled ? tw('bg-surface-disabled') : tw('bg-brand-primary'),
        {
          width: 319,
          height: 48,
          borderRadius: 5,
        },
      ]}
    >
      <Text
        style={[
          tw('font-primary-500 text-center text-base'),
          disabled
            ? tw('text-on-surface-disabled')
            : tw('text-on-surface-secondary'),
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default SquareButton;
