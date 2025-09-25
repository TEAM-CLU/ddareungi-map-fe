import { tw } from '@/shared/libs/tw-helper';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { BUTTON_PRESETS } from '@/shared/model/index.constants';

type ButtonPresetKey = keyof typeof BUTTON_PRESETS;

interface RoundButtonProps {
  title: string;
  onPress: () => void;
  preset: ButtonPresetKey;
  disabled?: boolean;
}

const RoundButton = ({
  title,
  onPress,
  preset,
  disabled = false,
}: RoundButtonProps) => {
  const presetStyle = BUTTON_PRESETS[preset];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[tw('justify-center items-center'),
        {
          backgroundColor: presetStyle.backgroundColor,
          minWidth: presetStyle.minWidth,
          height: presetStyle.height,
          borderRadius: presetStyle.borderRadius,
          paddingHorizontal: presetStyle.paddingHorizontal,
        },
      ]}
    >
      <Text
        style={[tw('text-center text-on-surface-secondary'),
          {
            fontSize: presetStyle.fontSize,
            fontFamily: presetStyle.fontFamily,
            lineHeight: presetStyle.lineHeight,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default RoundButton;

