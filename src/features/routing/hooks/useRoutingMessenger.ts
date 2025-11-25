import { useProvideWebviewMessenger } from '@/shared/hooks/useProvideWebviewMessenger';
import {
  ClearStaticPathMessage,
  DrawStaticPathMessage,
  FocusOnStaticPathMessage,
  StaticPathData,
} from '@/shared/model/map.webview.types';
import { useCallback } from 'react';

/**
 * 경로(Route) 관련 WebView 통신 훅
 */

export const useRoutingMessenger = () => {
  const { sendMessage } = useProvideWebviewMessenger();

  // 정적 경로 생성 (출발지/도착지/경유지 정보 포함)
  const drawStaticPath = useCallback(
    (messageParam: StaticPathData) => {
      const message: DrawStaticPathMessage = {
        type: 'drawStaticPath',
        staticPathData: {
          ...messageParam,
        },
      };
      sendMessage(message);
    },
    [sendMessage],
  );

  // 정적 경로 제거
  const clearStaticPath = useCallback(() => {
    const message: ClearStaticPathMessage = {
      type: 'clearStaticPath',
    };
    sendMessage(message);
  }, [sendMessage]);

  // 정적 경로에 맞게 지도 bounds 조정
  const focusOnStaticPath = useCallback(() => {
    const message: FocusOnStaticPathMessage = {
      type: 'focusOnStaticPath',
    };
    sendMessage(message);
  }, [sendMessage]);

  return {
    drawStaticPath,
    clearStaticPath,
    focusOnStaticPath,
  };
};
