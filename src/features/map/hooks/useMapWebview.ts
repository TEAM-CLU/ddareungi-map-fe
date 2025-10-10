import { useCallback } from 'react';
import WebView from 'react-native-webview';
import { 
  WebViewMessageFromRN,
  ShowPlaceMarkerMessage,
  MoveToLocationMessage,
  ShowSearchResultsMessage,
  ClearSearchMessage,
  UpdateRouteMessage,
  ClearRouteMessage,
  SetRouteTypeMessage,
  MoveToRoutePointMessage
} from '../model/map.webview.types';

export interface MapWebviewHook {
  sendMessage: (message: WebViewMessageFromRN) => void;
  
  // 검색 관련 함수들
  showPlaceMarker: (lat: number, lng: number, placeName: string, placeInfo?: any) => void;
  moveToLocation: (lat: number, lng: number, placeName: string) => void;
  showSearchResults: (places: Array<{lat: number; lng: number; name: string; address?: string; category?: string;}>) => void;
  clearCurrentPlaceMarker: () => void;
  clearSearchMarkers: () => void;
  clearAllSearchElements: () => void;
  
  // 라우팅 관련 함수들
  updateRoute: (routeType: 'CONSTANT' | 'LOOP', points: Array<{id: string; lat: number; lng: number; name: string;}>) => void;
  clearRoute: () => void;
  setRouteType: (routeType: 'CONSTANT' | 'LOOP') => void;
  moveToRoutePoint: (pointId: string) => void;
}

export const useMapWebview = (
  webRef: React.RefObject<WebView | null>,
  isMapReady: boolean,
): MapWebviewHook => {
  const sendMessage = useCallback(
    (message: WebViewMessageFromRN) => {
      if (isMapReady && webRef.current) {
        console.log('📤 WebView로 메시지 전송:', message);
        webRef.current.postMessage(JSON.stringify(message));
      } else {
        console.warn('⚠️ WebView가 준비되지 않음:', { isMapReady, hasWebRef: !!webRef.current });
      }
    },
    [isMapReady, webRef],
  );

  // === 검색 관련 함수들 ===
  const showPlaceMarker = useCallback((lat: number, lng: number, placeName: string, placeInfo?: any) => {
    const message: ShowPlaceMarkerMessage = {
      type: 'showPlaceMarker',
      lat,
      lng,
      placeName,
      placeInfo
    };
    sendMessage(message);
  }, [sendMessage]);

  const moveToLocation = useCallback((lat: number, lng: number, placeName: string) => {
    const message: MoveToLocationMessage = {
      type: 'moveToLocation',
      lat,
      lng,
      placeName
    };
    sendMessage(message);
  }, [sendMessage]);

  const showSearchResults = useCallback((places: Array<{lat: number; lng: number; name: string; address?: string; category?: string;}>) => {
    const message: ShowSearchResultsMessage = {
      type: 'showSearchResults',
      places
    };
    sendMessage(message);
  }, [sendMessage]);

  const clearCurrentPlaceMarker = useCallback(() => {
    const message: ClearSearchMessage = {
      type: 'clearCurrentPlaceMarker'
    };
    sendMessage(message);
  }, [sendMessage]);

  const clearSearchMarkers = useCallback(() => {
    const message: ClearSearchMessage = {
      type: 'clearSearchMarkers'
    };
    sendMessage(message);
  }, [sendMessage]);

  const clearAllSearchElements = useCallback(() => {
    const message: ClearSearchMessage = {
      type: 'clearAllSearchElements'
    };
    sendMessage(message);
  }, [sendMessage]);

  // === 라우팅 관련 함수들 ===
  const updateRoute = useCallback((routeType: 'CONSTANT' | 'LOOP', points: Array<{id: string; lat: number; lng: number; name: string;}>) => {
    const message: UpdateRouteMessage = {
      type: 'updateRoute',
      routeType,
      points
    };
    sendMessage(message);
  }, [sendMessage]);

  const clearRoute = useCallback(() => {
    const message: ClearRouteMessage = {
      type: 'clearRoute'
    };
    sendMessage(message);
  }, [sendMessage]);

  const setRouteType = useCallback((routeType: 'CONSTANT' | 'LOOP') => {
    const message: SetRouteTypeMessage = {
      type: 'setRouteType',
      routeType
    };
    sendMessage(message);
  }, [sendMessage]);

  const moveToRoutePoint = useCallback((pointId: string) => {
    const message: MoveToRoutePointMessage = {
      type: 'moveToRoutePoint',
      pointId
    };
    sendMessage(message);
  }, [sendMessage]);

  return {
    sendMessage,
    
    // 검색 관련
    showPlaceMarker,
    moveToLocation,
    showSearchResults,
    clearCurrentPlaceMarker,
    clearSearchMarkers,
    clearAllSearchElements,
    
    // 라우팅 관련
    updateRoute,
    clearRoute,
    setRouteType,
    moveToRoutePoint,
  };
};