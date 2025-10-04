import { useContext } from 'react';
import { AuthContext, AuthContextType } from './context';

export const useAuth = (): AuthContextType => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('useAuth must be used within <AuthProvider>.');
  }
  return authContext;
};
