import { useEffect, type RefObject } from 'react';
import { Alert } from 'react-native';
import { NavigationWalkingPolicy } from '@/shared/model/map.webview.types';
import { ApplyNavigationDataInput } from '@/features/navigation/hooks/useNavigationDataApply';
import { useStartNavigationSessionMutation } from '../services/navigation.queries';
import { useNavigationStore } from '../stores/useNavigationStore';

export type UseNavigationSessionLifecycleParams = {
  isNavigationMode: boolean;
  routeId: string | null;
  isMapReady: boolean;
  resetAllNavigationState: () => void;
  applyNavigationData: (
    data: ApplyNavigationDataInput,
    walkingPolicy?: NavigationWalkingPolicy,
  ) => void;
  setSessionId: (id: string | null) => void;
  setIsNavigationInitialized: (v: boolean) => void;
  isHandlingOffRouteRef: RefObject<boolean>;
};

export const useNavigationSessionLifecycle = ({
  isNavigationMode,
  routeId,
  isMapReady,
  resetAllNavigationState,
  applyNavigationData,
  setSessionId,
  setIsNavigationInitialized,
  isHandlingOffRouteRef,
}: UseNavigationSessionLifecycleParams) => {
  const { mutateAsync: startNavigationSession } =
    useStartNavigationSessionMutation();

  const setIsNavigationMode = useNavigationStore(
    state => state.setIsNavigationMode,
  );

  // 초기화
  useEffect(() => {
    if (!isNavigationMode || !routeId) return;
    // 초기화
    resetAllNavigationState();

    const initNavigation = async () => {
      try {
        // 세션 시작 요청
        const { data } = await startNavigationSession({ routeId });

        // 성공 시 데이터 적용
        setSessionId(data.sessionId);

        // 공통 데이터 적용 함수 사용
        applyNavigationData({
          coordinates: data.coordinates,
          instructions: data.instructions,
        });

        setIsNavigationInitialized(true);
        isHandlingOffRouteRef.current = false;
      } catch (error: any) {
        const serverMessage = error.response?.data?.message;
        const displayMessage = serverMessage
          ? `${serverMessage}`
          : '일시적인 네트워크 문제로 연결할 수 없습니다.\n잠시 후 다시 시도해주세요.';

        Alert.alert(
          '경로 안내를 시작할 수 없어요',
          displayMessage,
          [
            {
              text: '이전으로 돌아가기',
              onPress: () => {
                setIsNavigationMode(false);
              },
              style: 'default',
            },
          ],
          { cancelable: false },
        );
      }
    };

    initNavigation();
  }, [
    isNavigationMode,
    routeId,
    isMapReady,
    applyNavigationData,
    startNavigationSession,
    setIsNavigationMode,
  ]);
};
