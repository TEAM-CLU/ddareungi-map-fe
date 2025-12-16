// filepath: /Users/master/dev/ddareungi-map-fe/src/app/providers/webview/provider.ts
import { WebViewRefCtx } from '@/app/providers/webview/context';
import React, { useRef } from 'react';
import type WebView from 'react-native-webview';

export const WebViewRefProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const webViewRef = useRef<WebView | null>(null);

  return (
    <WebViewRefCtx.Provider value={webViewRef}>
      {children}
    </WebViewRefCtx.Provider>
  );
};
