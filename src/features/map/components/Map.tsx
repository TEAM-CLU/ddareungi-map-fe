import { useEffect, useRef, useState } from 'react';
import {
  check,
  Permission,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import { Platform, Alert, Linking, BackHandler } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import {
  hasLocationPermission,
  requestLocationPermission,
} from '@/features/map/utils/location';

const Map = () => {
  const webRef = useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState(false);

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
    const myLocation = {
      type: 'myLocation',
      lat: latitude,
      lon: longitude,
      heading: heading,
      accuracy: accuracy,
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
        distanceFilter: 5,
        interval: 1000,
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

  return (
    <WebView
      ref={webRef}
      onMessage={handleMapReadyMessage}
      source={{
        uri: 'https://f43f9c8fc97d.ngrok-free.app/dev/ddareungi-map-fe/map.html',
      }}
    />
  );
};
export default Map;
