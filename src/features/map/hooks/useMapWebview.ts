import { RefObject, useCallback } from 'react';
import WebView from 'react-native-webview';
import { WebViewMessageToRN } from '../../../shared/model/map.webview.types';
import { useMapStore } from '../stores/useMapStore';

/**
 * RN ↔ WebView 간 메시지 전송을 위한 공통 Hook
 */
export const useMapWebview = () => {
  const { webRef } = useMapStore();
  const sendMessage = useCallback(
    (message: WebViewMessageToRN) => {
      if (!webRef || !webRef.current) {
        console.warn('⚠️ WebView ref is null — 메시지 전송 불가');
        return;
      }
      webRef.current.postMessage(JSON.stringify(message));
    },
    [webRef],
  );

  return { sendMessage };
};
