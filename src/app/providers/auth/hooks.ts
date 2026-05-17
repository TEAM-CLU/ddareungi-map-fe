import { useContext } from 'react';
import { AuthContext } from './context';
import { AuthContextType } from '@/shared/model/shared.types';

export const useAuth = (): AuthContextType => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('useAuth must be used within <AuthProvider>.');
  }
  return authContext;
};
