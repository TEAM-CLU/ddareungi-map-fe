import React, { useLayoutEffect, useMemo } from 'react';
import {
  useWindowDimensions,
  PixelRatio,
  Platform,
  StyleSheet,
} from 'react-native';
import { create } from 'tailwind-rn';
import utilitiesJson from '../../../../styles.json';
import { TailwindCtx } from './context';
import type {
  Environment as TWEnv,
  Utilities as TWUtilities,
} from 'tailwind-rn/dist/types';
import { TW } from '@/shared/model/shared.types';
import { setTw } from '@/shared/libs/tw-helper';

export const TailwindProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { width, height } = useWindowDimensions();

  const env: TWEnv = useMemo(
    () => ({
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      colorScheme: 'light',
      width,
      height,
      orientation: width > height ? 'landscape' : 'portrait',
      pixelDensity: PixelRatio.get(),
      fontScale: PixelRatio.getFontScale(),
      rem: 16,
      hairlineWidth: StyleSheet.hairlineWidth,
      reduceMotion: false,
    }),
    [width, height],
  );

  const tw = useMemo<TW>(
    () => create(utilitiesJson as unknown as TWUtilities, env),
    [env],
  );

  useLayoutEffect(() => {
    setTw(tw);
  }, [tw]);

  return <TailwindCtx.Provider value={tw}>{children}</TailwindCtx.Provider>;
};
