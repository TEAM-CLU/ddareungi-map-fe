import { RefObject, useCallback } from 'react';
import WebView from 'react-native-webview';
import { WebViewMessageToRN } from '../../../shared/model/map.webview.types';
import { useMapStore } from '../stores/useMapStore';
import { useWebViewRef } from '@/app/providers/webview';

/**
 * RN ↔ WebView 간 메시지 전송을 위한 공통 Hook
 */
export const useMapWebview = () => {
  const webViewRef = useWebViewRef();
  const sendMessage = useCallback(
    (message: WebViewMessageToRN) => {
      if (!webViewRef.current) {
        console.warn('⚠️ WebView ref is null — 메시지 전송 불가');
        return;
      }
      webViewRef.current.postMessage(JSON.stringify(message));
    },
    [webViewRef],
  );

  return { sendMessage };
};
