import { useEffect, useRef } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { requestLocationPermission } from '@/features/map/utils/location';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { useMeasurementStore } from '../stores/useMeasurementStore';
import { smoothPosition } from '@/features/location/utils/smoothPosition';
import type { Coordinate } from '@/shared/model/shared.types';

/**
 * 측정 화면에 있는 동안만 위치 추적하여 useMyPositionStore 갱신.
 * Map이 언마운트된 상태에서도 실시간 위치로 거리/속도 측정 가능.
 */
export function useMeasurementLocation(): void {
  const isActive = useMeasurementStore(s => s.isMeasurementScreenActive);
  const setLocationMetaData = useMyPositionStore(s => s.setLocationMetaData);
  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<Coordinate | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (watchIdRef.current != null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    let cancelled = false;

    (async () => {
      if (!(await requestLocationPermission())) return;
      if (cancelled) return;

      const watchId = Geolocation.watchPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const smoothed = smoothPosition(
            latitude,
            longitude,
            lastPositionRef.current,
          );
          lastPositionRef.current = smoothed;

          setLocationMetaData({
            timestamp: position.timestamp ?? Date.now(),
            accuracy: position.coords.accuracy,
            osSpeed: position.coords.speed ?? undefined,
            coordinate: {
              lat: smoothed.lat,
              lng: smoothed.lng,
            },
          });
        },
        () => {},
        {
          enableHighAccuracy: true,
          distanceFilter: 0,
          interval: 3000,
          fastestInterval: 2000,
          forceRequestLocation: true,
        },
      );
      watchIdRef.current = watchId;
    })();

    return () => {
      cancelled = true;
      if (watchIdRef.current != null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      lastPositionRef.current = null;
    };
  }, [isActive, setLocationMetaData]);
}
