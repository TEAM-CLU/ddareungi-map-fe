import { Coordinates } from '@/features/map/model/map.types';

// 좌표 두개 비교하여 거리 계산
export const getDistanceBetweenCoords = (
  prev: Coordinates,
  next: Coordinates,
): number => {
  const R = 6371e3; // 지구 반지름 (단위: m)
  const φ1 = (prev.lat * Math.PI) / 180; // 위도1 (라디안)
  const φ2 = (next.lat * Math.PI) / 180; // 위도2 (라디안)
  const Δφ = ((next.lat - prev.lat) * Math.PI) / 180; // 위도 차
  const Δλ = ((next.lng - prev.lng) * Math.PI) / 180; // 경도 차

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // 최종 거리 (미터)
  return d;
};
