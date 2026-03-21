import { Coordinate } from '@/shared/model/shared.types';

export const smoothPosition = (
  lat: number,
  lng: number,
  lastPosition: Coordinate | null,
) => {
  if (!lastPosition) {
    lastPosition = { lat, lng };
    return { lat, lng };
  }
  const prev = lastPosition;
  const smoothedcoord = {
    // 현재 위치에 70% 가중치를 주어 실제 이동 거리가 충분히 반영되도록 한다.
    lat: prev.lat * 0.3 + lat * 0.7,
    lng: prev.lng * 0.3 + lng * 0.7,
  };
  lastPosition = smoothedcoord;
  return smoothedcoord;
};
