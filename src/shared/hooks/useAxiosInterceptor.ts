import { useEffect } from 'react';
import { api } from '@/shared/services/axios';
import { commonErrorInterceptor } from '@/shared/services/axiosConfig';

export const useAxiosInterceptor = (onLogout: () => Promise<void>) => {
  useEffect(() => {
    // 인터셉터 설치
    const interceptorId = commonErrorInterceptor(api, onLogout);

    // 클린업 (언마운트 시 제거)
    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [onLogout]);
};