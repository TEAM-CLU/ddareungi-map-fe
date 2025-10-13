import { useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import { requestLocationPermission } from '@/features/map/utils/location';
import { Coordinates } from '@/features/map/model/map.types';
import { useUserHeading } from '@/features/map/hooks/useCompassHeading';
import {
  MyHeadingMessage,
  WebViewMessageToRN,
} from '../model/map.webview.types';

interface MapProps {
  webRef: React.RefObject<WebView | null>;
}
const Map = ({ webRef }: MapProps) => {
  const [isMapReady, setIsMapReady] = useState(false);
  const lastPos = useRef<Coordinates | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const heading = useUserHeading({
    triggerDeg: 1,
    updateDeg: 1,
    throttleMs: 16,
    smoothAlpha: 0.6,
  });

  // 현위치와 이전 위치 중간값 사용하여 위치 변화 보정 로직
  const smoothPosition = (lat: number, lon: number) => {
    if (!lastPos.current) {
      lastPos.current = { lat, lon };
      return { lat, lon };
    }
    const prev = lastPos.current;
    const smoothedCoords = {
      lat: prev.lat * 0.5 + lat * 0.5,
      lon: prev.lon * 0.5 + lon * 0.5,
    };
    lastPos.current = smoothedCoords;
    return smoothedCoords;
  };

  // WebView → RN - 지도 준비 완료, 마커 표시 등 WebView 이벤트 수신
  const handleMapReadyMessage = (event: WebViewMessageEvent) => {
    try {
      const data: WebViewMessageToRN = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case 'mapReady':
          console.log('✅ 지도 준비 완료');
          setIsMapReady(true);
          break;

        case 'placeMarkerShown':
          console.log('📍 장소 마커 표시됨:', data.placeName);
          break;

        case 'mapMovedToLocation':
          console.log('🗺️ 지도 이동 완료:', data);
          break;

        default:
          console.warn('🔔 처리되지 않은 메시지:', data);
      }
    } catch (error) {
      console.error('Invalid JSON from WebView:', event.nativeEvent.data);
    }
  };

  // RN → WebView - 내 위치를 지도에 전송
  const sendLocation = (currentPosition: Geolocation.GeoPosition) => {
    if (!isMapReady) {
      console.warn('⚠️ 지도가 아직 준비 안됨');
      return;
    }
    const { latitude, longitude, accuracy } = currentPosition.coords;

    if (accuracy > 30) return;
    const { lat, lon } = smoothPosition(latitude, longitude);
    const myLocation = {
      type: 'myLocation',
      lat: lat,
      lon: lon,
      accuracy: accuracy ?? 0,
    };
    webRef.current?.postMessage(JSON.stringify(myLocation));
  };

  // 실시간 내 위치 추적 시작
  const startLocationTracking = async () => {
    if (!(await requestLocationPermission())) return;
  
    if (watchIdRef.current != null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const watchId = Geolocation.watchPosition(
      currentPosition => {
        sendLocation(currentPosition);
      },
      error => {
        Alert.alert('오류', '위치 정보를 가져오는 중 오류가 발생했습니다.');
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 7,
        interval: 3000,
        forceRequestLocation: true,
        fastestInterval: 2000,
      },
    );
    watchIdRef.current = watchId;
  };

  // 위치 추적 중단
  const stopLocationTracking = () => {
    if (watchIdRef.current != null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  useEffect(() => {
    // 지도가 준비되면 위치 추적 시작
    if (!isMapReady) return;
    startLocationTracking();
    return stopLocationTracking;
  }, [isMapReady]);

  // 방향로직과 위치로직 분리해서 방향은 위치 변화없이도 실시간으로 움직이도록
  useEffect(() => {
    if (!isMapReady) return;

    const headingMessage: MyHeadingMessage = {
      type: 'myHeading',
      heading: heading ?? 0,
    };

    webRef.current?.postMessage(JSON.stringify(headingMessage));
  }, [heading, isMapReady]);

  // 앱이 포그라운드로 돌아올 때 위치 추적 재시작(구독)
  useEffect(() => {
    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active' && isMapReady) startLocationTracking();
    });
    return () => appStateSubscription.remove();
  }, [isMapReady]);

  return (
    <WebView
      ref={webRef}
      onMessage={handleMapReadyMessage}
      onError={e => console.log('WebView error', e.nativeEvent)}
      source={{
        uri: 'https://92ad6e451828.ngrok-free.app/dev/ddareungi-map-fe/map.html',
      }}
    />
  );
};
export default Map;
