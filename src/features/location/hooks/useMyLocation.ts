import { useEffect, useRef, useState } from 'react';
import { AppState, Alert } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import { requestLocationPermission } from '@/features/map/utils/location';
import { useUserHeading } from '@/features/map/hooks/useCompassHeading';
import { Use } from 'react-native-svg';
import { Coordinates } from '@/features/map/model/map.types';
import {
  MyHeadingMessage,
  MyLocationMessage,
  WebViewMessageToRN,
} from '@/shared/model/map.webview.types';

interface UseMyLocationProps {
  webRef: React.RefObject<WebView | null>;
  setMyPosition: React.Dispatch<React.SetStateAction<Coordinates | undefined>>;
}
export const useMyLocation = ({
  webRef,
  setMyPosition,
}: UseMyLocationProps) => {
  const [isMapReady, setIsMapReady] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastPos = useRef<{ lat: number; lon: number } | null>(null);

  // 보정된 방향값 추출
  const heading = useUserHeading({
    triggerDeg: 1,
    updateDeg: 1,
    throttleMs: 16,
    smoothAlpha: 0.6,
  });

  // 위치 보정 (이전 위치와 절반씩 섞기)
  const smoothPosition = (lat: number, lon: number) => {
    if (!lastPos.current) {
      lastPos.current = { lat, lon };
      return { lat, lon };
    }
    const prev = lastPos.current;
    const smoothedcoord = {
      lat: prev.lat * 0.5 + lat * 0.5,
      lon: prev.lon * 0.5 + lon * 0.5,
    };
    lastPos.current = smoothedcoord;
    return smoothedcoord;
  };

  // 위치 전송
  const sendLocation = (
    currentPosition: Geolocation.GeoPosition,
    opts?: { bypassAccuracyOnce?: boolean },
  ) => {
    if (!isMapReady) return;
    const { latitude, longitude, accuracy } = currentPosition.coords;
    if (!opts?.bypassAccuracyOnce && accuracy > 30) return;

    const { lat, lon } = smoothPosition(latitude, longitude);
    const myLocation: MyLocationMessage = {
      type: 'myLocation',
      lat,
      lon,
      accuracy: accuracy ?? 0,
    };

    webRef.current?.postMessage(JSON.stringify(myLocation));
  };

  // 위치 추적 시작
  const startLocationTracking = async () => {
    if (!(await requestLocationPermission())) return;

    if (watchIdRef.current != null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // 지도 준비 직후 1회 전송 (정확도 필터 우회)
    Geolocation.getCurrentPosition(
      pos => {
        setMyPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        sendLocation(pos, { bypassAccuracyOnce: true });
      },
      err => console.warn('getCurrentPosition error:', err?.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    );

    // 실시간 추적
    const watchId = Geolocation.watchPosition(
      pos => {
        setMyPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        sendLocation(pos);
      },
      _err =>
        Alert.alert('오류', '위치 정보를 가져오는 중 오류가 발생했습니다.'),
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 3000,
        fastestInterval: 2000,
        forceRequestLocation: true,
      },
    );
    watchIdRef.current = watchId;
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current != null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // mapReady 메시지 전용 핸들러
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

  // 지도 준비되면 위치 추적 시작, 언마운트시 중지
  useEffect(() => {
    if (!isMapReady) return;
    startLocationTracking();
    return stopLocationTracking;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapReady]);

  // 방향은 위치와 무관하게 실시간으로 송신
  useEffect(() => {
    if (!isMapReady) return;
    const myHeading: MyHeadingMessage = {
      type: 'myHeading',
      heading: heading ?? 0,
    };
    webRef.current?.postMessage(JSON.stringify(myHeading));
  }, [heading, isMapReady, webRef]);

  // 앱이 foreground로 복귀 시 추적 재시작
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && isMapReady) startLocationTracking();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapReady]);

  return {
    isMapReady,
    handleMapReadyMessage,
  };
};
