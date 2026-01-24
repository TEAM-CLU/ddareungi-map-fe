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

  useMyLocation({ isMapReady, mapReadyVersion });
  const webViewRef = useWebViewRef();

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

  return (
    <WebView
      ref={webViewRef}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      originWhitelist={['*']}
      onMessage={handleWebViewMessage}
      onError={e => console.log('WebView error', e.nativeEvent)}
      cacheEnabled={false}
      cacheMode="LOAD_NO_CACHE"
      incognito={true}
      source={{
        uri: 'https://e5b66509b553.ngrok-free.app/dev/ddareungi-map-fe/map.html',
      }}
    />
  );
};
export default Map;
