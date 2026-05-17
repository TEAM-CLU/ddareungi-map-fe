import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { useMyLocation } from '@/features/location/hooks/useMyLocation';
import { useStation } from '@/features/station/hooks/useStation';
import { useMapStore } from '../stores/useMapStore';
import { useBookmark } from '@/features/bookmark/hooks/useBookmark';
import { useWebViewRef } from '@/app/providers/webview';
import { useShallow } from 'zustand/react/shallow';
interface MapProps {
  onMessage: (event: WebViewMessageEvent) => void;
}
const Map = ({ onMessage }: MapProps) => {
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
    onMessage(event);
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
      onError={() => {}}
      source={{
        uri: 'https://ssumpick.com/map',
      }}
    />
  );
};
export default Map;
