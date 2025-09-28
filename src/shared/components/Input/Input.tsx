import { tw } from '@/shared/libs/tw-helper';
import { textInputAttrSettingMap } from '@/shared/model/index.data';
import { InputType } from '@/shared/model/index.types';
import { useMemo, useState } from 'react';
import { TextInput } from 'react-native';

interface InputProps {
  type: InputType;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  isValid: boolean;
}

const Input = ({
  type,
  placeholder = '',
  value = '',
  onChangeText = () => {},
  isValid,
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const settingValsByType = useMemo(
    () => textInputAttrSettingMap[type] || {},
    [type],
  );

  return (
    <TextInput
      returnKeyType="done"
      value={value}
      placeholder={placeholder}
      placeholderTextColor={'#A7A7A7'}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onChangeText={onChangeText}
      {...settingValsByType}
      style={[
        tw(
          'border py-3.5 font-primary-500 text-base text-on-surface-primary h-12 w-full',
        ),
        isValid
          ? isFocused
            ? tw('border-brand-primary')
            : tw('border-line-default')
          : tw('border-error'),
        {
          paddingHorizontal: 14,
          borderRadius: 5,
          lineHeight: 20,
        },
      ]}
    />
  );
};

export default Input;
