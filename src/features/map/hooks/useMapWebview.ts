import { useCallback } from 'react';
import WebView from 'react-native-webview';
import { WebViewMessageFromRN } from '../model/map.webview.types';

/**
 * RN ↔ WebView 간 메시지 전송을 위한 공통 Hook
 */
export const useMapWebview = (webRef: React.RefObject<WebView | null>) => {
  const sendMessage = useCallback((message: WebViewMessageFromRN) => {
    if (!webRef.current) {
      console.warn('⚠️ WebView ref is null — 메시지 전송 불가');
      return;
    }
    webRef.current.postMessage(JSON.stringify(message));
  }, [webRef]);

  return { sendMessage };
};