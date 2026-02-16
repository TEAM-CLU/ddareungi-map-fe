import { Alert, AlertButton } from 'react-native';
import { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';

/**
 * 에러에서 사용자에게 표시할 메시지를 추출합니다.
 */
function getDisplayMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // Axios 에러: 백엔드 메시지 또는 기본 메시지
    return (
      error.response?.data?.message ||
      error.message ||
      '알 수 없는 오류가 발생했습니다.'
    );
  }

  if (error instanceof Error) {
    return error.message || '알 수 없는 오류가 발생했습니다.';
  }

  if (typeof error === 'string') {
    return error;
  }

  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 인터셉터가 이미 에러를 처리했는지 확인합니다.
 * 인터셉터는 401/403/5xx/네트워크 에러에 대해 Toast/Alert를 표시합니다.
 */
function isAlreadyHandledByInterceptor(error: unknown): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    // 인터셉터가 처리하는 에러들
    if (
      status === 401 ||
      status === 403 ||
      (status && status >= 500) ||
      error.message.includes('Network Error') ||
      error.code === 'ECONNABORTED'
    ) {
      return true;
    }
  }

  // 인터셉터가 설정한 커스텀 메시지로 판단
  const message = getDisplayMessage(error);
  const interceptorMessages = [
    '로그인이 만료되었습니다.',
    '권한이 없습니다.',
    '서버 점검 중입니다.',
    '인터넷 연결이 불안정합니다.',
  ];

  return interceptorMessages.some(msg => message.includes(msg));
}

/**
 * 에러 처리 옵션 타입
 */
export type HandleErrorOptions =
  | { mode: 'silent' } // 로깅만, 사용자 알림 없음
  | { mode: 'toast' } // Toast 표시 (인터셉터가 이미 표시했으면 생략)
  | {
      mode: 'alert';
      title?: string;
      message?: string;
      buttons?: AlertButton[];
    } // Alert 표시
  | {
      mode: 'terminateNavigation';
      onTerminate: () => void;
      title?: string;
      message?: string;
    } // 네비게이션 종료
  | {
      mode: 'custom';
      onHandle: (error: unknown) => void;
    }; // 커스텀 처리

/**
 * 공통 에러 핸들러 함수
 *
 * 모든 try-catch 블록에서 사용하여 일관된 에러 처리를 수행합니다.
 *
 * @example
 * ```typescript
 * try {
 *   // 작업...
 * } catch (error) {
 *   handleCatch(error, { mode: 'silent' });
 * }
 * ```
 *
 * @example
 * ```typescript
 * try {
 *   // 작업...
 * } catch (error) {
 *   handleCatch(error, {
 *     mode: 'alert',
 *     title: '오류',
 *     message: '작업을 완료할 수 없습니다.',
 *   });
 * }
 * ```
 *
 * @example
 * ```typescript
 * try {
 *   // 작업...
 * } catch (error) {
 *   handleCatch(error, {
 *     mode: 'terminateNavigation',
 *     onTerminate: terminateNavigationSafely,
 *     title: '네비게이션 종료',
 *     message: '오류로 인해 네비게이션을 종료합니다.',
 *   });
 * }
 * ```
 */
export function handleCatch(error: unknown, options: HandleErrorOptions): void {
  // 모든 에러는 로깅
  console.error('Error caught:', error);

  switch (options.mode) {
    case 'silent':
      // 로깅만 하고 종료
      return;

    case 'toast':
      // 인터셉터가 이미 처리했으면 생략
      if (isAlreadyHandledByInterceptor(error)) {
        return;
      }

      const toastMessage = getDisplayMessage(error);
      Toast.show({
        type: 'error',
        text1: '오류 발생',
        text2: toastMessage,
      });
      return;

    case 'alert':
      // 인터셉터가 이미 처리했으면 생략
      if (isAlreadyHandledByInterceptor(error)) {
        return;
      }

      const alertMessage =
        options.message || getDisplayMessage(error);
      Alert.alert(
        options.title || '오류',
        alertMessage,
        options.buttons || [{ text: '확인' }],
      );
      return;

    case 'terminateNavigation':
      // 네비게이션 종료 콜백 호출
      options.onTerminate();

      // Alert 표시 (인터셉터가 이미 처리했으면 생략)
      if (!isAlreadyHandledByInterceptor(error)) {
        const terminateMessage =
          options.message ||
          getDisplayMessage(error) ||
          '오류로 인해 네비게이션을 종료합니다.';
        Alert.alert(
          options.title || '네비게이션 종료',
          terminateMessage,
          [{ text: '확인' }],
        );
      }
      return;

    case 'custom':
      options.onHandle(error);
      return;
  }
}
