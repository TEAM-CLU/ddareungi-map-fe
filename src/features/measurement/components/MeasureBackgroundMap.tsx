import React, { useCallback, useEffect, useRef, useState } from 'react';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { useLocationStore } from '@/features/location/stores/useLocationStore';
import type { LocationMode } from '@/features/location/model/location.types';

interface MapReadyPayload {
  type: string;
  isReady?: boolean;
}

interface MeasureBackgroundMapProps {
  /** true이면 위치 업데이트마다 항상 내 위치로 재센터링 (분할 모드에서 사용) */
  isTracking?: boolean;
  /** WebView 맵이 준비되면 1회 호출 */
  onMapReady?: () => void;
}

/**
 * 측정 화면 전용 배경 지도.
 * 전역 webViewRef/지도 오케스트레이터를 쓰지 않아 내비/메인맵과 충돌하지 않는다.
 */
export default function MeasureBackgroundMap({
  isTracking = true,
  onMapReady,
}: MeasureBackgroundMapProps) {
  const webViewRef = useRef<WebView | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const prevLocationModeRef = useRef<LocationMode>('default');
  const locationMetaData = useMyPositionStore(s => s.locationMetaData);
  const locationMode = useLocationStore(s => s.locationMode);

  const sendRawMessage = useCallback((message: object) => {
    if (!isMapReady || !webViewRef.current) return;
    webViewRef.current.postMessage(JSON.stringify(message));
  }, [isMapReady]);

  const sendCenterOnMyLocation = useCallback(() => {
    sendRawMessage({ type: 'setCenterOnMyLocation' });
  }, [sendRawMessage]);

  const sendCompassMode = useCallback(
    (isCompassMode: boolean) => {
      sendRawMessage({
        type: isCompassMode ? 'myLocationCompassOn' : 'myLocationCompassOff',
        isCompassMode,
      });
    },
    [sendRawMessage],
  );

  const handleWebViewMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data) as MapReadyPayload;
        if (payload.type === 'mapReady' && payload.isReady) {
          setIsMapReady(true);
          onMapReady?.();
        }
      } catch {
        // ignore malformed payloads
      }
    },
    [onMapReady],
  );

  useEffect(() => {
    if (!isMapReady) return;

    const prevMode = prevLocationModeRef.current;
    const isLeavingCompass =
      prevMode === 'compass' && locationMode !== 'compass';
    const isEnteringFollowing =
      prevMode !== 'following' && locationMode === 'following';
    const isEnteringCompass = prevMode !== 'compass' && locationMode === 'compass';

    // myLocationButton 정책과 동일:
    // - following: 진입 시 1회 내 위치로 센터 이동
    // - compass: 진입 시 센터 이동 + 나침반 모드 on
    // - compass 이탈: 나침반 모드 off
    if (isEnteringFollowing || isEnteringCompass) {
      sendCenterOnMyLocation();
    }

    if (locationMode === 'compass') {
      sendCompassMode(true);
    } else if (isLeavingCompass) {
      sendCompassMode(false);
    }

    prevLocationModeRef.current = locationMode;
  }, [isMapReady, locationMode, sendCenterOnMyLocation, sendCompassMode]);

  useEffect(() => {
    if (!locationMetaData?.coordinate) return;
    if (!isMapReady) return;

    sendRawMessage({
      type: 'updateMyLocation',
      lat: locationMetaData.coordinate.lat,
      lng: locationMetaData.coordinate.lng,
      accuracy: locationMetaData.accuracy ?? 0,
    });

    // isTracking(분할 모드): 항상 내 위치로 재센터링
    // 전체화면 모드: compass 모드일 때만 재센터링 (사용자가 자유롭게 지도 탐색 가능)
    if (isTracking || locationMode === 'compass') {
      sendCenterOnMyLocation();
    }
  }, [isMapReady, locationMetaData, locationMode, isTracking, sendRawMessage, sendCenterOnMyLocation]);

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
}
