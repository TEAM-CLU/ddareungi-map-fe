import { useEffect } from 'react';
import { useKeepNavigationSessionAliveMutation } from '../services/navigation.queries';

export interface UseNavigationSessionKeepAliveParams {
  isNavigationMode: boolean;
  sessionId: string | null;
  isNavigationInitialized: boolean;
}

export const useNavigationSessionKeepAlive = ({
  isNavigationMode,
  sessionId,
  isNavigationInitialized,
}: UseNavigationSessionKeepAliveParams) => {
  const { mutate: keepNavigationSessionAlive } =
    useKeepNavigationSessionAliveMutation();

  // 세션 유지
  useEffect(() => {
    if (!isNavigationMode || !sessionId || !isNavigationInitialized) return;

    const tick = () => {
      keepNavigationSessionAlive(
        { sessionId },
        {
          onError: () => {},
        },
      );
    };

    const intervalId = setInterval(tick, 9 * 60 * 1000); // 9분마다 세션 유지 요청

    return () => {
      clearInterval(intervalId);
    };
  }, [
    isNavigationMode,
    sessionId,
    isNavigationInitialized,
    keepNavigationSessionAlive,
  ]);
};
