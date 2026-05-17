import { SPEED_THRESHOLDS } from '@/features/navigation/model/navigation.constants';
import { TransportationType } from '@/shared/model/shared.types';

export const classifyTransportBySpeed = (
  speedMps: number,
): TransportationType => {
  if (!Number.isFinite(speedMps) || speedMps <= 0) return 'walking';
  if (speedMps >= SPEED_THRESHOLDS.BIKING_MIN_MPS) return 'biking';
  return 'walking';
};
