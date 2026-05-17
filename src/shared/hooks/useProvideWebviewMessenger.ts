import { useCallback } from 'react';
import { useWebViewRef } from '@/app/providers/webview';
import { WebViewMessageToWeb } from '@/shared/model/map.webview.types';

/**
 * RN ↔ WebView 간 메시지 전송을 위한 공통 Hook
 */
export const useProvideWebviewMessenger = () => {
  const webViewRef = useWebViewRef();
  const sendMessage = useCallback(
    (message: WebViewMessageToWeb) => {
      if (!webViewRef.current) {
        return;
      }
      webViewRef.current.postMessage(JSON.stringify(message));
    },
    [webViewRef],
  );

  return { sendMessage };
};
