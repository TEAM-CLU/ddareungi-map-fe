import { CURRENT_YEAR } from '@/shared/model/index.constants';
import { InputType } from '@/shared/model/index.types';
import { Platform } from 'react-native';

// Input 컴포넌트 관련 맵
export const textInputAttrSettingMap: Record<InputType, object> = {
  text: { keyboardType: 'default' },
  password: {
    keyboardType: 'default',
    secureTextEntry: true,
    autoCapitalize: 'none',
    autoComplete: 'password',
    textContentType: 'password',
  },
  email: {
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    autoComplete: 'email',
    textContentType: 'emailAddress',
  },
  number: {
    keyboardType: Platform.OS === 'ios' ? 'number-pad' : 'numeric',
    autoCapitalize: 'none',
  },
  decimal: {
    keyboardType: 'decimal-pad',
    autoCapitalize: 'none',
  },
  tel: {
    keyboardType: 'phone-pad',
    autoCapitalize: 'none',
    autoComplete: 'tel',
    textContentType: 'telephoneNumber',
  },
  url: {
    keyboardType: 'url',
    autoCapitalize: 'none',
    autoComplete: 'off',
    textContentType: 'URL',
  },
  search: {
    keyboardType: 'default',
    returnKeyType: 'search',
    autoCapitalize: 'none',
  },
  username: {
    keyboardType: 'default',
    autoCapitalize: 'none',
    autoComplete: 'username',
    textContentType: 'username',
  },
  name: {
    keyboardType: 'default',
    autoCapitalize: 'words',
    autoComplete: 'name',
    textContentType: 'name',
  },
};

// Date 배열
export const yearList = Array.from({ length: 100 }, (_, i) => {
  const year = CURRENT_YEAR - i;
  return { label: `${year}년`, value: year };
});

export const monthList = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1;
  return { label: `${month}월`, value: month };
});
