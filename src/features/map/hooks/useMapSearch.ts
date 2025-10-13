import { useCallback } from 'react';
import { useMapWebview } from './useMapWebview';
import {
  ShowPlaceMarkerMessage,
  MoveToLocationMessage,
  ShowSearchResultsMessage,
  ClearSearchMessage,
} from '../model/map.webview.types';
import WebView from 'react-native-webview';

/**
 * 검색 관련 WebView 통신 훅
 */
export const useMapSearch = (
  webRef: React.RefObject<WebView | null>,
) => {
  const { sendMessage } = useMapWebview(webRef);

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

  const moveToLocation = useCallback(
    (lat: number, lng: number, placeName: string) => {
      const message: MoveToLocationMessage = {
        type: 'moveToLocation',
        lat,
        lng,
        placeName,
      };
      sendMessage(message);
    },
    [sendMessage],
  );

  const showSearchResults = useCallback(
    (places: Array<{ lat: number; lng: number; name: string; address?: string; category?: string }>) => {
      const message: ShowSearchResultsMessage = {
        type: 'showSearchResults',
        places,
      };
      sendMessage(message);
    },
    [sendMessage],
  );

  const clearSearchMarkers = useCallback(() => {
    const message: ClearSearchMessage = { type: 'clearSearchMarkers' };
    sendMessage(message);
  }, [sendMessage]);

  const clearAllSearchElements = useCallback(() => {
    const message: ClearSearchMessage = { type: 'clearAllSearchElements' };
    sendMessage(message);
  }, [sendMessage]);

  return {
    showPlaceMarker,
    moveToLocation,
    showSearchResults,
    clearSearchMarkers,
    clearAllSearchElements,
  };
};