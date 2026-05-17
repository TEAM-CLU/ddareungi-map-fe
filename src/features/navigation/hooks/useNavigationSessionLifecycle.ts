import { useEffect, useRef, type RefObject } from 'react';
import {
  NavigationPathMode,
  NavigationWalkingPolicy,
} from '@/shared/model/map.webview.types';
import { ApplyNavigationDataInput } from '@/features/navigation/model/navigation.types';
import { useStartNavigationSessionMutation } from '../services/navigation.queries';
import { useNavigationStore } from '../stores/useNavigationStore';
import { handleCatch } from '@/shared/utils/errorHandler';

export interface UseNavigationSessionLifecycleParams {
  isNavigationMode: boolean;
  routeId: string | null;
  isMapReady: boolean;
  resetAllNavigationState: () => void;
  applyNavigationData: (
    data: ApplyNavigationDataInput,
    walkingPolicy?: NavigationWalkingPolicy,
    pathMode?: NavigationPathMode,
  ) => void;
  setSessionId: (id: string | null) => void;
  setIsNavigationInitialized: (v: boolean) => void;
  isHandlingOffRouteRef: RefObject<boolean>;
}

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
  const isStartingSessionRef = useRef(false);
  const startedRouteIdRef = useRef<string | null>(null);

  const setIsNavigationMode = useNavigationStore(
    state => state.setIsNavigationMode,
  );

  // 내비게이션 모드 해제 시 시작 가드 리셋
  useEffect(() => {
    if (isNavigationMode && routeId) return;

    isStartingSessionRef.current = false;
    startedRouteIdRef.current = null;
    setIsNavigationInitialized(false);
  }, [isNavigationMode, routeId, setIsNavigationInitialized]);

  // 세션 시작 초기화
  useEffect(() => {
    if (!isNavigationMode || !routeId || !isMapReady) return;
    if (isStartingSessionRef.current) return;
    if (startedRouteIdRef.current === routeId) return;

    isStartingSessionRef.current = true;
    setIsNavigationInitialized(false);

    // 초기화
    resetAllNavigationState();
    let isCancelled = false;

    const initNavigation = async () => {
      try {
        // 세션 시작 요청
        const { data } = await startNavigationSession({ routeId });
        if (isCancelled) return;

        // 성공 시 데이터 적용
        setSessionId(data.sessionId);

        // 공통 데이터 적용 함수 사용
        applyNavigationData({
          coordinates: data.coordinates,
          instructions: data.instructions,
        });

        setIsNavigationInitialized(true);
        startedRouteIdRef.current = routeId;
        isHandlingOffRouteRef.current = false;
      } catch (error: any) {
        startedRouteIdRef.current = null;
        handleCatch(error, {
          mode: 'alert',
          title: '경로 안내를 시작할 수 없어요',
          message:
            error.response?.data?.message ||
            '일시적인 네트워크 문제로 연결할 수 없습니다.\n잠시 후 다시 시도해주세요.',
          buttons: [
            {
              text: '이전으로 돌아가기',
              onPress: () => {
                setIsNavigationMode(false);
              },
              style: 'default',
            },
          ],
        });
      } finally {
        isStartingSessionRef.current = false;
      }
    };

    initNavigation();

    return () => {
      isCancelled = true;
    };
  }, [
    isNavigationMode,
    routeId,
    isMapReady,
    applyNavigationData,
    startNavigationSession,
    setIsNavigationMode,
  ]);
};
