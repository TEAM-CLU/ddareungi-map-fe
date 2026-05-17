import { useContext } from 'react';
import { TailwindCtx } from './context';
import { TW } from '@/shared/model/shared.types';

export const useTailwind = (): TW => {
  const tailwindCtx = useContext(TailwindCtx);
  if (!tailwindCtx)
    throw new Error('useTailwind must be used within <TailwindProvider>.');
  return tailwindCtx;
};
