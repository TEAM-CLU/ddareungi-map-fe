import { MotionVectorResult } from '@/features/navigation/model/navigation.types';
import { Coordinate } from '@/features/routing/model/routing.types';

export const calculateMotionVector = (
  prevPosition: Coordinate,
  currentPosition: Coordinate,
  targetPosition: Coordinate,
  dtSec: number,
): MotionVectorResult => {
  const safeDt = Math.max(0.001, dtSec);

  // lat/lng -> meter 근사 변환 (current 위도 기준)
  const lat0 = currentPosition.lat;
  const metersPerDegLat = 111_320;
  const metersPerDegLng = 111_320 * Math.cos((lat0 * Math.PI) / 180);

  // v = current - prev  (이동 벡터)
  const vx = (currentPosition.lng - prevPosition.lng) * metersPerDegLng;
  const vy = (currentPosition.lat - prevPosition.lat) * metersPerDegLat;

  const moveMag = Math.hypot(vx, vy);
  const speedMps = moveMag / safeDt;

  // u = target - current (현재 위치에서 턴 포인트로 향하는 벡터)
  const ux = (targetPosition.lng - currentPosition.lng) * metersPerDegLng;
  const uy = (targetPosition.lat - currentPosition.lat) * metersPerDegLat;

  const dot = vx * ux + vy * uy;

  return { moveMag, speedMps, dot };
};
