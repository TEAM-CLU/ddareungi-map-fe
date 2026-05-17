import { createContext } from 'react';
import WebView from 'react-native-webview';

export const WebViewRefCtx =
  createContext<React.RefObject<WebView | null> | null>(null);
