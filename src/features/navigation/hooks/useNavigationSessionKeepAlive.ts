import { useEffect } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';

import {
  keepNavigationSessionAlivePayload,
  keepNavigationSessionAliveResponse,
} from '@/features/navigation/model/navigation.types';

export type UseNavigationSessionKeepAliveParams = {
  isNavigationMode: boolean;
  sessionId: string | null;
  isNavigationInitialized: boolean;
  keepNavigationSessionAlive: (
    payload: keepNavigationSessionAlivePayload,
  ) => Promise<keepNavigationSessionAliveResponse>;
};

export const useNavigationSessionKeepAlive = ({
  isNavigationMode,
  sessionId,
  isNavigationInitialized,
  keepNavigationSessionAlive,
}: UseNavigationSessionKeepAliveParams) => {
  // 세션 유지
  useEffect(() => {
    if (!isNavigationMode || !sessionId || !isNavigationInitialized) return;
    const keepSessionAlive = async () => {
      try {
        const payload: keepNavigationSessionAlivePayload = {
          sessionId: sessionId,
        };

        await keepNavigationSessionAlive(payload);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          Alert.alert(
            `${
              error.response?.data?.message ??
              '내비게이션 세션 유지 중 오류가 발생했습니다. 다시 시도해주세요.'
            }`,
          );
        }
      }
    };

    const intervalId = setInterval(() => {
      keepSessionAlive();
    }, 9 * 60 * 1000); // 9분마다 세션 유지 요청

    return () => {
      clearInterval(intervalId);
    };
  }, [isNavigationMode, sessionId, isNavigationInitialized]);
};
