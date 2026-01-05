// 공통 에러 핸들러
// - 1. 중요 에러: Alert로 사용자에게 즉시 알림 (예: 401, 403)
// - 2. 일반 에러: Toast로 간단히 알림 (예: 500, 네트워크 오류 등)
// - 3. 커스텀 에러 메시지 생성 후 throw

import axios, { AxiosError, AxiosInstance } from 'axios';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

export const commonErrorInterceptor = (
  instance: AxiosInstance,
  onLogout?: () => Promise<void> | void,
) => {
  return instance.interceptors.response.use(
    response => response,
    async (error: AxiosError<{ message?: string }>) => {
      // 취소된 요청은 무시
      if (axios.isCancel(error)) return Promise.reject(error);

      const status = error.response?.status;
      let customMessage = '알 수 없는 오류가 발생했습니다.';

      // 1. 중요 에러 (Alert)
      if (status === 401) {
        Alert.alert(
          '인증 만료',
          '세션이 만료되었습니다. 다시 로그인해주세요.',
          [
            {
              text: '확인',
              onPress: async () => {
                if (onLogout) await onLogout();
              },
            },
          ],
        );
        return Promise.reject(new Error('로그인이 만료되었습니다.'));
      }
      if (status === 403) {
        Alert.alert('권한 없음', '접근 권한이 없습니다.');
        return Promise.reject(new Error('권한이 없습니다.'));
      }

      // 2. 공통 에러 (Toast)
      if (status && status >= 500) {
        Toast.show({
          type: 'error',
          text1: '서버 오류',
          text2: '잠시 후 다시 시도해주세요.',
        });
        customMessage = '서버 점검 중입니다.';
      } else if (
        error.message.includes('Network Error') ||
        error.code === 'ECONNABORTED'
      ) {
        Toast.show({
          type: 'error',
          text1: '네트워크 오류',
          text2: '인터넷 연결을 확인해주세요.',
        });
        customMessage = '인터넷 연결이 불안정합니다.';
      } else if (status === 400 || status === 404) {
        // 백엔드에서 보내준 에러 메시지가 있으면 그걸 우선 사용
        customMessage =
          error.response?.data?.message || '요청을 처리할 수 없습니다.';
      }

      const customError = new Error(customMessage);
      return Promise.reject(customError);
    },
  );
};
