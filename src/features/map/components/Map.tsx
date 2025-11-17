import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { useMyLocation } from '@/features/location/hooks/useMyLocation';
import { useStation } from '@/features/station/hooks/useStation';
import { RefObject } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { MapAreaStationData } from '@/features/station/model/station.types';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useMapStore } from '../stores/useMapStore';

const Map = () => {
  const { webRef } = useMapStore();
  const { handleMapReadyMessage, isMapReady } = useMyLocation();

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

  return (
    <WebView
      ref={webRef}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      originWhitelist={['*']}
      onMessage={handleWebViewMessage}
      onError={e => console.log('WebView error', e.nativeEvent)}
      source={{
        uri: 'https://0a961d74ca7a.ngrok-free.app/dev/ddareungi-map-fe/map.html',
      }}
    />
  );
};
export default Map;
