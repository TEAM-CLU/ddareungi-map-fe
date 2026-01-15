import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './context';
import { ACCESS_TOKEN_KEY } from '@/shared/model/index.constants';
import { useAxiosInterceptor } from '@/shared/hooks/useAxiosInterceptor';
import { setClientToken } from '@/shared/services/axios';

export const AuthProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // 앱 실행 시 저장된 토큰 있는지 확인
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
          setAccessTokenState(token);
          setClientToken(token);
        }
      } catch (error) {
        console.error('토큰 로드 실패:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };
    loadToken();
  }, []);

  // 토큰 저장
  const setToken = useCallback(async (token: string) => {
    setAccessTokenState(token);
    setClientToken(token);
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  }, []);

  // 토큰 가져오기
  // AsyncStorage에서 매번 가져오는 대신 상태값 반환
  const getToken = useCallback(async () => {
    return accessToken;
  }, [accessToken]);

  // 토큰 삭제
  const removeToken = useCallback(async () => {
    setAccessTokenState(null);
    setClientToken(null);
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  }, []);

  // 토큰 있는지 확인
  const hasToken = useCallback(() => {
    return !!accessToken;
  }, [accessToken]);

  useAxiosInterceptor(removeToken);

  const value = useMemo(
    () => ({
      accessToken,
      isAuthLoading,
      setToken,
      getToken,
      removeToken,
      hasToken,
    }),
    [accessToken, isAuthLoading, setToken, getToken, removeToken, hasToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
