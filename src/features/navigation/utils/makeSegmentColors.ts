import { BIKING_POLYLINE_COLORS } from '@/features/navigation/model/navigation.constants';

export const makeSegmentColors = (waypointCount: number) => {
  const segmentCount = waypointCount + 1;
  return Array.from(
    { length: segmentCount },
    (_, segIdx) =>
      BIKING_POLYLINE_COLORS[segIdx % BIKING_POLYLINE_COLORS.length],
  );
};
