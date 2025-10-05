import { AuthContextType } from '@/shared/model/index.types';
import { createContext } from 'react';

export const AuthContext = createContext<AuthContextType | null>(null);
