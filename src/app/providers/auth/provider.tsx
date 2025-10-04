import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './context';
import { ACCESS_TOKEN_KEY } from '@/shared/model/index.constants';

export const AuthProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);

  // 앱 시작 시 토큰 불러오기
  useEffect(() => {
    AsyncStorage.getItem(ACCESS_TOKEN_KEY).then(token => {
      if (token) {
        setAccessTokenState(token);
      }
    });
  }, []);

  // 토큰 저장
  const setToken = useCallback(async (token: string) => {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    setAccessTokenState(token);
  }, []);

  // 토큰 가져오기
  const getToken = useCallback(async () => {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  }, []);

  // 토큰 삭제
  const removeToken = useCallback(async () => {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    setAccessTokenState(null);
  }, []);

  // 토큰 있는지 확인
  const hasToken = useCallback(() => {
    return !!accessToken;
  }, [accessToken]);

  const value = useMemo(
    () => ({
      accessToken,
      setToken,
      getToken,
      removeToken,
      hasToken,
    }),
    [accessToken, setToken, getToken, removeToken, hasToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
