import { TW } from '@/shared/model/index.types';
import { createContext } from 'react';

export const TailwindCtx = createContext<TW | null>(null);
