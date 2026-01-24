import { useEffect, useRef } from 'react';
import { AppState, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { requestLocationPermission } from '@/features/map/utils/location';
import { useUserHeading } from '@/features/map/hooks/useCompassHeading';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { useWebViewRef } from '@/app/providers/webview';
import { useLocationMessenger } from '@/features/location/hooks/useLocationMessenger';
import { DataSetForUpdateMyLocation } from '@/features/location/model/location.types';
import { Coordinates } from '@/features/map/model/map.types';
import { smoothPosition } from '@/features/location/utils/smoothPosition';

interface UseMyLocationParams {
  isMapReady: boolean;
}

export const useMyLocation = ({ isMapReady }: UseMyLocationParams) => {
  const { updateMyLocation, rotateMyHeading } = useLocationMessenger();
  const setLocationMetaData = useMyPositionStore(
    state => state.setLocationMetaData,
  );

  const webViewRef = useWebViewRef();
  const watchIdRef = useRef<number | null>(null);
  const lastPosition = useRef<Coordinates | null>(null);

  // 위치 전송
  const sendLocation = (
    currentPosition: Geolocation.GeoPosition,
    opts?: { bypassAccuracyOnce?: boolean },
  ) => {
    if (!isMapReady) return;
    const { latitude, longitude, accuracy } = currentPosition.coords;
    if (!opts?.bypassAccuracyOnce && accuracy > 30) return;

    const { lat, lng } = smoothPosition(
      latitude,
      longitude,
      lastPosition.current,
    );
    const myLocationData: DataSetForUpdateMyLocation = {
      lat,
      lng,
      accuracy: accuracy ?? 0,
    };

    updateMyLocation(myLocationData);
    lastPosition.current = { lat, lng };
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
      position => {
        setLocationMetaData({
          timestamp: position.timestamp ?? Date.now(),
          accuracy: position.coords.accuracy,
          osSpeed: position.coords.speed ?? undefined,
          coordinate: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
        sendLocation(position, { bypassAccuracyOnce: true });
      },
      error => console.error('사용자 위치 가져오기 오류:', error?.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    );

    // 실시간 추적
    const watchId = Geolocation.watchPosition(
      position => {
        setLocationMetaData({
          timestamp: position.timestamp ?? Date.now(),
          accuracy: position.coords.accuracy,
          osSpeed: position.coords.speed ?? undefined,
          coordinate: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
        sendLocation(position);
      },
      error => console.error('실시간 위치 추적 오류:', error?.message),
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

  // 보정된 방향값 추출
  const heading = useUserHeading({
    triggerDeg: 1,
    updateDeg: 1,
    throttleMs: 16,
    smoothAlpha: 0.6,
  });

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
    rotateMyHeading(heading);
  }, [heading, isMapReady, rotateMyHeading, webViewRef]);

  // 앱이 foreground로 복귀 시 추적 재시작
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && isMapReady) startLocationTracking();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapReady]);
};
