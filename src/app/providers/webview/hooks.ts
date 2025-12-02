import { useContext } from 'react';
import type WebView from 'react-native-webview';
import { WebViewRefCtx } from './context';

export const useWebViewRef = (): React.RefObject<WebView | null> => {
  const webViewRef = useContext(WebViewRefCtx);
  if (!webViewRef) {
    throw new Error('useWebViewRef must be used within WebViewRefProvider');
  }
  return webViewRef;
};
