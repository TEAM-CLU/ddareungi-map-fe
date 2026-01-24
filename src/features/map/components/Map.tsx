import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { useMyLocation } from '@/features/location/hooks/useMyLocation';
import { useStation } from '@/features/station/hooks/useStation';
import { useMapStore } from '../stores/useMapStore';
import { useBookmark } from '@/features/bookmark/hooks/useBookmark';
import { useWebViewRef } from '@/app/providers/webview';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
interface MapProps {
  handleMapReadyMessage: (event: WebViewMessageEvent) => void;
}
const Map = ({ handleMapReadyMessage }: MapProps) => {
  const { isMapReady, mapReadyVersion } = useMapStore(
    useShallow(state => ({
      isMapReady: state.isMapReady,
      mapReadyVersion: state.mapReadyVersion,
    })),
  );

  const webViewRef = useWebViewRef();
  useMyLocation({ isMapReady, mapReadyVersion });

  const { handleStationMessage } = useStation({
    isMapReady,
    mapReadyVersion,
  });

  const { handleBookmarkMarkerClick } = useBookmark({
    isMapReady,
    mapReadyVersion,
  });

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    handleMapReadyMessage(event);
    handleStationMessage(event);
    handleBookmarkMarkerClick(event);
  };

  // 디자인 후에 삭제
  // [수정] 컴포넌트가 처음 렌더링될 때 딱 한 번만 URL을 생성해서 state에 저장합니다.
  const [mapUrl] = useState(() => {
    const timestamp = new Date().getTime();
    // iOS/Android 환경에 따라 주소 분기 (ngrok 주소면 그대로 사용)
    const baseUrl = 'https://57ba20d69663.ngrok-free.app/map.html';
    return `${baseUrl}?t=${timestamp}`;
  });

  return (
    <WebView
      ref={webViewRef}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      originWhitelist={['*']}
      onMessage={handleWebViewMessage}
      onError={e => console.log('WebView error', e.nativeEvent)}
      // 캐시 끄기 옵션도 확실하게 추가 디자인 후 삭제
      cacheEnabled={false}
      cacheMode="LOAD_NO_CACHE"
      incognito={true}
      source={{ uri: 'https://57ba20d69663.ngrok-free.app/map.html' }}
    />
  );
};
export default Map;
