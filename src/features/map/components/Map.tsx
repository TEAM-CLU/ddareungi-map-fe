import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { useMyLocation } from '@/features/location/hooks/useMyLocation';
import { useStation } from '@/features/station/hooks/useStation';
import { RefObject } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { MapAreaStationsData } from '@/features/station/model/station.types';
import { Coordinates } from '@/features/map/model/map.types';

interface MapProps {
  webRef: React.RefObject<WebView | null>;
  stationDetailModalRef: RefObject<BottomSheetModal | null>;
  setStationMetaData: React.Dispatch<
    React.SetStateAction<MapAreaStationsData | null>
  >;
  setMyPosition: React.Dispatch<React.SetStateAction<Coordinates | undefined>>;
}
const Map = ({
  webRef,
  stationDetailModalRef,
  setStationMetaData,
  setMyPosition,
}: MapProps) => {
  const { handleMapReadyMessage, isMapReady } = useMyLocation({
    webRef,
    setMyPosition,
  });
  const {
    handleMapCenterChanged,
    handleStationsInventoriesUpdate,
    handleStationMarkerClick,
  } = useStation({
    webRef,
    isMapReady,
    setStationMetaData,
    stationDetailModalRef,
  });

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    handleMapReadyMessage(event);
    handleMapCenterChanged(event);
    handleStationsInventoriesUpdate(event);
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
        uri: 'https://a4eb15520cc3.ngrok-free.app/map.html',
      }}
    />
  );
};
export default Map;
