import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { useMyLocation } from '@/features/location/hooks/useMyLocation';
import { useStations } from '@/features/station/hooks/useStations';

interface MapProps {
  webRef: React.RefObject<WebView | null>;
}
const Map = ({ webRef }: MapProps) => {
  const { handleMapReadyMessage, isMapReady } = useMyLocation({ webRef });
  const { handleMapCenterChanged, handleStationsInventoriesUpdate } =
    useStations({ webRef, isMapReady });

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    handleMapReadyMessage(event);
    handleMapCenterChanged(event);
    handleStationsInventoriesUpdate(event);
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
        uri: 'https://270357fbdb8f.ngrok-free.app/dev/ddareungi-map-fe/map.html',
      }}
    />
  );
};
export default Map;
