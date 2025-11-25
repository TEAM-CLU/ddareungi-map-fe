import { useProvideWebviewMessenger } from '@/features/map/hooks/useProvideWebviewMessenger';
import {
  ShowPlaceMarkerMessage,
  ClearCurrentPlaceMarkerMessage,
} from '@/shared/model/map.webview.types';
import { useCallback } from 'react';

/**
 * 검색 관련 WebView 통신 훅
 */
export const useSearchMessenger = () => {
  const { sendMessage } = useProvideWebviewMessenger();

  const showPlaceMarker = useCallback(
    (lat: number, lng: number, placeName: string, placeInfo?: any) => {
      const message: ShowPlaceMarkerMessage = {
        type: 'showPlaceMarker',
        lat,
        lng,
        placeName,
        placeInfo,
      };
      sendMessage(message);
    },
    [sendMessage],
  );

  const clearCurrentPlaceMarker = useCallback(() => {
    const message: ClearCurrentPlaceMarkerMessage = {
      type: 'clearCurrentPlaceMarker',
    };
    sendMessage(message);
  }, [sendMessage]);

  return {
    showPlaceMarker,
    clearCurrentPlaceMarker,
  };
};
