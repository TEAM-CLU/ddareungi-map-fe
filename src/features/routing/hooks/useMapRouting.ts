import { useMapWebview } from '@/features/map/hooks/useMapWebview';
import {
  UpdateRouteMessage,
  ClearRouteMessage,
  SetRouteTypeMessage,
  MoveToRoutePointMessage,
} from '@/shared/model/map.webview.types';
import { useCallback } from 'react';
import WebView from 'react-native-webview';

/**
 * 경로(Route) 관련 WebView 통신 훅
 */
export const useMapRouting = (webRef: React.RefObject<WebView | null>) => {
  const { sendMessage } = useMapWebview(webRef);

  // 경로 업데이트 (출발지/도착지/경유지 정보 포함)
  const updateRoute = useCallback(
    (
      routeType: 'CONSTANT' | 'LOOP',
      points: Array<{ id: string; lat: number; lng: number; name: string }>,
      path?: Array<{ lat: number; lng: number }>,
    ) => {
      const message: UpdateRouteMessage = {
        type: 'updateRoute',
        routeType,
        points,
      };
      if (path && path.length > 0) {
        message.path = path;
      }
      sendMessage(message);
    },
    [sendMessage],
  );

  // 경로 초기화
  const clearRoute = useCallback(() => {
    const message: ClearRouteMessage = { type: 'clearRoute' };
    sendMessage(message);
  }, [sendMessage]);

  // 경로 타입 설정
  const setRouteType = useCallback(
    (routeType: 'CONSTANT' | 'LOOP') => {
      const message: SetRouteTypeMessage = {
        type: 'setRouteType',
        routeType,
      };
      sendMessage(message);
    },
    [sendMessage],
  );

  // 특정 경로 포인트로 이동
  const moveToRoutePoint = useCallback(
    (pointId: string) => {
      const message: MoveToRoutePointMessage = {
        type: 'moveToRoutePoint',
        pointId,
      };
      sendMessage(message);
    },
    [sendMessage],
  );

  return {
    updateRoute,
    clearRoute,
    setRouteType,
    moveToRoutePoint,
  };
};
