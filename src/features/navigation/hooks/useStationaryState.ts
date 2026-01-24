import { useEffect, type RefObject } from 'react';

import { LocationMetaData } from '@/features/navigation/model/navigation.types';
import { TRANSPORT_STATE_CONFIG } from '@/features/navigation/model/navigation.constants';
import { Coordinates } from '@/features/map/model/map.types';
import { getDistanceBetweenCoords } from '@/shared/utils/measure';

export type UseStationaryStateParams = {
  locationMetaData: LocationMetaData | null;
  locationTick: number | undefined;
  currentLocationMetaData: RefObject<LocationMetaData | null>;
  isStationaryRef: RefObject<boolean>;
  stationaryCountRef: RefObject<number>;
  prevMyPositionForStationaryRef: RefObject<Coordinates | null>;
  prevTimestampForStationaryRef: RefObject<number | null>;
};

export const useStationaryState = ({
  locationMetaData,
  locationTick,
  currentLocationMetaData,
  isStationaryRef,
  stationaryCountRef,
  prevMyPositionForStationaryRef,
  prevTimestampForStationaryRef,
}: UseStationaryStateParams) => {
  const { STATIONARY_THRESHOLD, STATIONARY_DISTANCE_THRESHOLD } =
    TRANSPORT_STATE_CONFIG;

  // 정지 상태 판정 전용 (location tick 기반으로 항상 실행)
  useEffect(() => {
    // 항상 실행되어야 하므로 어떤 조건에 의한 early return을 두지 않습니다.
    const currentLocationMeta = currentLocationMetaData.current ?? locationMetaData;

    if (!currentLocationMeta) {
      // 위치 정보가 아직 없으면 정지 상태 초기화
      stationaryCountRef.current = 0;
      isStationaryRef.current = false;
      // 정상적으로 끝냄
      return;
    }

    const currentCoord = (currentLocationMeta as LocationMetaData).coordinate;
    const currentTimestamp =
      typeof currentLocationMeta.timestamp === 'number'
        ? currentLocationMeta.timestamp
        : Date.now();

    const prevPosition = prevMyPositionForStationaryRef.current;
    const prevTimestamp = prevTimestampForStationaryRef.current;

    // 위치 정보가 아직 없으면 정지 상태 초기화
    if (!currentCoord) {
      stationaryCountRef.current = 0;
      isStationaryRef.current = false;
      // 정상적으로 끝냄
      return;
    }

    // 첫 샘플이면 prev로 세팅하고 정지 상태 초기화
    if (!prevPosition || prevTimestamp == null) {
      prevMyPositionForStationaryRef.current = currentCoord;
      prevTimestampForStationaryRef.current = currentTimestamp;
      stationaryCountRef.current = 0;
      isStationaryRef.current = false;
      return;
    }

    // 이동 거리 계산
    const movedDistanceMeter = getDistanceBetweenCoords(
      prevPosition,
      currentCoord,
    );

    if (movedDistanceMeter <= STATIONARY_DISTANCE_THRESHOLD) {
      stationaryCountRef.current += 1;
      if (stationaryCountRef.current >= STATIONARY_THRESHOLD) {
        isStationaryRef.current = true;
      }
    } else {
      // 이동이 감지되면 즉시 정지 상태 해제
      stationaryCountRef.current = 0;
      isStationaryRef.current = false;
    }

    // prev 갱신
    prevMyPositionForStationaryRef.current = currentCoord;
    prevTimestampForStationaryRef.current = currentTimestamp;
  }, [locationTick]);
};
