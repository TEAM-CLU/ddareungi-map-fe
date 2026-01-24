import { Coordinates } from '@/features/map/model/map.types';

export const smoothPosition = (
  lat: number,
  lng: number,
  lastPosition: Coordinates | null,
) => {
  if (!lastPosition) {
    lastPosition = { lat, lng };
    return { lat, lng };
  }
  const prev = lastPosition;
  const smoothedcoord = {
    lat: prev.lat * 0.5 + lat * 0.5,
    lng: prev.lng * 0.5 + lng * 0.5,
  };
  lastPosition = smoothedcoord;
  return smoothedcoord;
};
