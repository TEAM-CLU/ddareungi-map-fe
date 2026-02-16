import { useEffect, type RefObject } from 'react';
import { LocationMetaData } from '@/features/navigation/model/navigation.types';
import { TRANSPORT_STATE_CONFIG } from '@/features/navigation/model/navigation.constants';
import { Coordinate } from '@/shared/model/shared.types';
import { getDistanceBetweenCoords } from '@/shared/utils/measure';

export type UseStationaryStateParams = {
  locationMetaData: LocationMetaData | null;
  locationTick: number | undefined;
  currentLocationMetaData: RefObject<LocationMetaData | null>;
  isStationaryRef: RefObject<boolean>;
  stationaryCountRef: RefObject<number>;
  prevMyPositionForStationaryRef: RefObject<Coordinate | null>;
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
    // 1. 현재 위치 정보 가져오기
    const currentLocationMeta =
      currentLocationMetaData.current ?? locationMetaData;
    const currentCoord = currentLocationMeta?.coordinate ?? null;

    // 2. 위치 데이터가 유효하지 않으면 리셋 후 종료
    if (!currentLocationMeta) {
      stationaryCountRef.current = 0;
      isStationaryRef.current = false;
      return;
    }

    const prevCoord = prevMyPositionForStationaryRef.current;

    // 3. 이전 위치가 없으면 (첫 진입) 현재 위치만 저장하고 종료
    if (!prevCoord) {
      prevMyPositionForStationaryRef.current = currentCoord;
      if (prevTimestampForStationaryRef) {
        prevTimestampForStationaryRef.current =
          currentLocationMeta.timestamp ?? Date.now();
      }
      return;
    }

    // 4. 이동거리 계산
    const movedDistanceMeter = getDistanceBetweenCoords(
      prevCoord as Coordinate,
      currentCoord as Coordinate,
    );

    // 5. 정지/이동 판정 로직
    if (movedDistanceMeter <= STATIONARY_DISTANCE_THRESHOLD) {
      // 거의 안 움직이면 정지 카운트 증가
      stationaryCountRef.current += 1;

      if (stationaryCountRef.current >= STATIONARY_THRESHOLD) {
        isStationaryRef.current = true;
      }
    } else {
      // 이동이 감지되면 즉시 정지 상태 해제
      stationaryCountRef.current = 0;
      isStationaryRef.current = false;
    }

    // 6. 다음 비교를 위해 현재 위치 저장
    prevMyPositionForStationaryRef.current = currentCoord;

    // 타임스탬프 업데이트
    if (prevTimestampForStationaryRef) {
      prevTimestampForStationaryRef.current =
        currentLocationMeta.timestamp ?? Date.now();
    }
  }, [locationTick]);
};
