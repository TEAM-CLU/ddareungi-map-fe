import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { useMyLocation } from '@/features/location/hooks/useMyLocation';
import { useStation } from '@/features/station/hooks/useStation';
import { useMapStore } from '../stores/useMapStore';
import { useWebViewRef } from '@/app/providers/webview';
import { useEffect, useState } from 'react';
import { tw } from '@/shared/libs/tw-helper';
import { View, ActivityIndicator } from 'react-native';
interface MapProps {
  isLocalMapReady: boolean;
  setIsLocalMapReady: React.Dispatch<React.SetStateAction<boolean>>;
  handleMapReadyMessage: (event: WebViewMessageEvent) => void;
}
const Map = ({
  isLocalMapReady,
  setIsLocalMapReady,
  handleMapReadyMessage,
}: MapProps) => {
  const { isMapReady, setIsMapReady } = useMapStore();

  const webViewRef = useWebViewRef();
  useMyLocation({ isMapReady });

  const {
    handleMapCenterIdle,
    handleStationBikeCountListUpdate,
    handleStationMarkerClick,
  } = useStation({
    isMapReady,
  });

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    handleMapReadyMessage(event);
    handleMapCenterIdle(event);
    handleStationBikeCountListUpdate(event);
    handleStationMarkerClick(event);
  };

  // selectedRouteDetailModal에서 쓰기 위해 zustand용 isMapReady 동기화
  useEffect(() => {
    setIsMapReady(isLocalMapReady);
  }, [isLocalMapReady]);

  return (
    <WebView
      ref={webViewRef}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      originWhitelist={['*']}
      onMessage={handleWebViewMessage}
      onError={e => console.log('WebView error', e.nativeEvent)}
      source={{
        uri: 'https://6158f5ca3919.ngrok-free.app/dev/ddareungi-map-fe/map.html',
      }}
    />
  );
};
export default Map;
