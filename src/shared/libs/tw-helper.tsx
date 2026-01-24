import { TW } from '@/shared/model/shared.types';
import { Platform } from 'react-native';

let _tw: TW | null = null;

export const setTw = (twInstance: TW) => {
  _tw = twInstance;
};

export const tw: TW = (classNames: string) => {
  if (!_tw)
    throw new Error(
      'tw is not initialized. Wrap your app with TailwindProvider.',
    );

  if (classNames.includes('font-secondary')) {
    const fontFamily = Platform.OS === 'ios' ? '198' : 'HSYeolumMulbit';

    const baseStyles = _tw(
      classNames.replace(/\bfont-secondary\b/, ''),
    ) as Record<string, any>;
    return {
      ...baseStyles,
      fontFamily,
    };
  }
  return _tw(classNames);
};
