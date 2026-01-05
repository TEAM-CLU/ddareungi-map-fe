import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './context';
import { ACCESS_TOKEN_KEY } from '@/shared/model/index.constants';
import { commonErrorInterceptor } from '@/shared/services/axiosConfig';
import { api } from '@/shared/services/axios';

export const AuthProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

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

  // 앱 실행 시 저장된 토큰 있는지 확인
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
          setAccessTokenState(token);
        }
      } catch (error) {
        console.error('토큰 로드 실패:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };
    loadToken();
  }, []);

  // 앱 실행 시 인터셉터 설치
  useEffect(() => {
    const interceptorId = commonErrorInterceptor(api, removeToken);
    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [removeToken]);

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
