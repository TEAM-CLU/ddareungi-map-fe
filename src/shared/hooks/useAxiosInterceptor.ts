// AuthProvider와 Axios 연결 훅
import { useEffect } from 'react';
import { api } from '@/shared/services/axios';
import { commonErrorInterceptor } from '@/shared/services/axiosConfig';

export const useAxiosInterceptor = (removeToken: () => Promise<void>) => {
  useEffect(() => {
    // 401 에러 시 removeToken 호출
    const interceptorId = commonErrorInterceptor(api, removeToken);

    // 클린업 (언마운트 시 제거)
    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [removeToken]);
};