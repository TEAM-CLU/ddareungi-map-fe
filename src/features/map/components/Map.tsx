import { useEffect, useRef, useState } from 'react';
import {
  check,
  Permission,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import { Platform, Alert, Linking, BackHandler, AppState } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import {
  hasLocationPermission,
  requestLocationPermission,
} from '@/features/map/utils/location';
import { Coordinates } from '@/features/map/model/map.types';

const Map = () => {
  const webRef = useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const lastPos = useRef<Coordinates | null>(null);

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

  const handleMapReadyMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapReady' && data.isReady) {
        console.log('✅ 지도 준비 완료');
        setIsMapReady(true);
      }
    } catch (error) {
      console.error('Invalid JSON from WebView:', event.nativeEvent.data);
    }
  };

  const sendLocation = (currentPosition: Geolocation.GeoPosition) => {
    if (!isMapReady) {
      console.warn('⚠️ 지도가 아직 준비 안됨');
      return;
    }
    const { latitude, longitude, heading, accuracy } = currentPosition.coords;

    if (accuracy > 30) return;
    const { lat, lon } = smoothPosition(latitude, longitude);
    const myLocation = {
      type: 'myLocation',
      lat: lat,
      lon: lon,
      heading: heading ?? 0,
      accuracy: accuracy ?? 0,
    };
    webRef.current?.postMessage(JSON.stringify(myLocation));
  };

  // 실시간 내 위치 추적 시작
  const startLocationTracking = async () => {
    if (!(await requestLocationPermission())) {
      return;
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
        fastestInterval: 2000,
      },
    );
    return () => {
      // 언마운트 시 추적 중단
      Geolocation.clearWatch(watchId);
    };
  };

  useEffect(() => {
    // 지도가 준비되면 위치 추적 시작
    if (!isMapReady) return;
    let cleanup: (() => void) | undefined;

    const init = async () => {
      cleanup = await startLocationTracking();
    };

    init();

    // 컴포넌트 언마운트 시 위치 추적 중단
    return () => {
      cleanup?.();
    };
  }, [isMapReady]);

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
      source={{
        uri: 'https://73e8e9b60f3c.ngrok-free.app/dev/ddareungi-map-fe/map.html',
      }}
    />
  );
};
export default Map;
