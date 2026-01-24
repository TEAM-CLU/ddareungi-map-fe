import { useEffect, type RefObject } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';

import {
  StartNavigationSessionPayload,
  StartNavigationSessionResponse,
} from '@/features/navigation/model/navigation.types';
import { NavigationWalkingPolicy } from '@/shared/model/map.webview.types';
import { ApplyNavigationDataInput } from '@/features/navigation/hooks/useNavigationDataApply';

export type UseNavigationSessionLifecycleParams = {
  isNavigationMode: boolean;
  routeId: string | null;
  isMapReady: boolean;
  startNavigationSession: (
    payload: StartNavigationSessionPayload,
  ) => Promise<StartNavigationSessionResponse>;
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
  startNavigationSession,
  resetAllNavigationState,
  applyNavigationData,
  setSessionId,
  setIsNavigationInitialized,
  isHandlingOffRouteRef,
}: UseNavigationSessionLifecycleParams) => {
  // 초기화
  useEffect(() => {
    if (!isNavigationMode || !routeId) return;
    // 초기화
    resetAllNavigationState();

    const initNavigation = async () => {
      try {
        const payload: StartNavigationSessionPayload = {
          routeId,
        };

        const response: StartNavigationSessionResponse =
          await startNavigationSession(payload);
        setSessionId(response.data.sessionId);

        // 공통 데이터 적용 함수 사용
        applyNavigationData({
          coordinates: response.data.coordinates,
          instructions: response.data.instructions,
        });

        setIsNavigationInitialized(true);
        isHandlingOffRouteRef.current = false;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          Alert.alert(
            `${
              error.response?.data?.message ??
              '내비게이션 세션 시작 중 오류가 발생했습니다. 다시 시도해주세요.'
            }`,
          );
        }
      }
    };

    initNavigation();
  }, [isNavigationMode, routeId, isMapReady, applyNavigationData]);

};
