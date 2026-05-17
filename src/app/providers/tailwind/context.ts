import { TW } from '@/shared/model/shared.types';
import { createContext } from 'react';

export const TailwindCtx = createContext<TW | null>(null);
