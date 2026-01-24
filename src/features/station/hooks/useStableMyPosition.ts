import { useEffect, useRef, useState } from 'react';
import { Coordinates } from '@/features/map/model/map.types';
import { LocationMetaData } from '@/features/navigation/model/navigation.types';
import { STATION_MOTION_CONFIG } from '@/features/station/model/station.constants';
import { getDistanceBetweenCoords } from '@/shared/utils/measure';

interface UseStableMyPositionParams {
  locationMetaData?: LocationMetaData;
}

export const useStableMyPosition = ({
  locationMetaData,
}: UseStableMyPositionParams) => {
  const {
    MOVE_CONFIRM_COUNT,
    STATIONARY_DISTANCE_THRESHOLD,
    STABLE_UPDATE_DISTANCE_THRESHOLD,
  } = STATION_MOTION_CONFIG;

  const [stablePosition, setStablePosition] = useState<Coordinates | null>(
    null,
  );
  const prevPositionRef = useRef<Coordinates | null>(null);
  const stablePositionRef = useRef<Coordinates | null>(null);
  const stationaryPassCountRef = useRef(0);
  const movePassCountRef = useRef(0);

  useEffect(() => {
    const currentCoord = locationMetaData?.coordinate;
    if (!currentCoord) return;

    const commitStablePosition = (coord: Coordinates) => {
      stablePositionRef.current = coord;
      setStablePosition(coord);
    };

    if (!prevPositionRef.current) {
      prevPositionRef.current = currentCoord;
      commitStablePosition(currentCoord);
      return;
    }

    const movedDistance = getDistanceBetweenCoords(
      prevPositionRef.current,
      currentCoord,
    );

    if (movedDistance <= STATIONARY_DISTANCE_THRESHOLD) {
      stationaryPassCountRef.current += 1;
      movePassCountRef.current = 0;
    } else {
      movePassCountRef.current += 1;
      stationaryPassCountRef.current = 0;
      if (movePassCountRef.current >= MOVE_CONFIRM_COUNT) {
        const currentStable = stablePositionRef.current;
        const stableDistance = currentStable
          ? getDistanceBetweenCoords(currentStable, currentCoord)
          : Number.POSITIVE_INFINITY;

        if (stableDistance >= STABLE_UPDATE_DISTANCE_THRESHOLD) {
          commitStablePosition(currentCoord);
          movePassCountRef.current = 0;
        }
      }
    }

    prevPositionRef.current = currentCoord;
  }, [
    locationMetaData?.timestamp,
    locationMetaData?.coordinate?.lat,
    locationMetaData?.coordinate?.lng,
  ]);

  return stablePosition;
};
