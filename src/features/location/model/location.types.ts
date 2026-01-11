import WebView from 'react-native-webview';

// useMyLocation hook 내부 상태 타입
export interface UseMyLocationProps {
  webViewRef: React.RefObject<WebView | null>;
}

export interface DataSetForUpdateMyLocation {
  lat: number;
  lng: number;
  accuracy: number;
}
