import { useEffect, useRef, type RefObject } from 'react';
import {
  ACCURACY_OK,
  TTS_URL_PRESET,
  WAYPOINT_CONFIG,
} from '@/features/navigation/model/navigation.constants';
import {
  LocationMetaData,
  NavigationInstruction,
} from '@/features/navigation/model/navigation.types';
import { playTts } from '@/features/navigation/libs/playTts';
import { Route } from '@/features/routing/model/routing.types';
import { getDistanceBetweenCoords } from '@/shared/utils/measure';
import { Coordinate } from '@/shared/model/shared.types';

export interface UseWaypointControllerParams {
  isNavigationMode: boolean;
  isNavigationInitialized: boolean;
  locationMetaData: LocationMetaData | null;
  locationTick: number | undefined;
  selectedRouteData: Route | null;
  systemVolume: number;
  setPassedWaypointIndexes: React.Dispatch<React.SetStateAction<number[]>>;
  refs: {
    passedWaypointIdxSetRef: RefObject<Set<number>>;
    isWaypointEnteredRef: RefObject<boolean>;
    waypointCandidateIdxRef: RefObject<number>;
    waypointPassCountRef: RefObject<number>;
    fullPathCoordinateList: RefObject<[number, number][]>;
    instructionList: RefObject<NavigationInstruction[]>;
    currentIntervalIndex: RefObject<number>;
  };
}

export const useWaypointController = ({
  isNavigationMode,
  isNavigationInitialized,
  locationMetaData,
  locationTick,
  selectedRouteData,
  systemVolume,
  setPassedWaypointIndexes,
  refs,
}: UseWaypointControllerParams) => {
  const { ARRIVE_WAYPOINT_TTS_URL } = TTS_URL_PRESET;
  const prevCoordRef = useRef<Coordinate | null>(null);

  useEffect(() => {
    if (!isNavigationMode || !isNavigationInitialized) {
      prevCoordRef.current = null;
    }
  }, [isNavigationMode, isNavigationInitialized]);

  // 경유지 도착/지나침 감지
  useEffect(() => {
    // 1. 필수 데이터 검증
    const currentCoord = locationMetaData?.coordinate;
    const currentAccuracy = locationMetaData?.accuracy;
    const waypoints = selectedRouteData?.waypoints;

    if (
      !isNavigationMode ||
      !isNavigationInitialized ||
      !currentCoord ||
      !waypoints ||
      waypoints.length === 0
    )
      return;

    // 2. 정확도 체크
    if (typeof currentAccuracy === 'number' && currentAccuracy > ACCURACY_OK) {
      return;
    }

    // 3. 모든 경유지 다 지나쳤으면 끝
    if (refs.passedWaypointIdxSetRef.current.size >= waypoints.length) return;

    const {
      ENTRY_RADIUS_METER,
      EXIT_RADIUS_METER,
      PASS_CONFIRM_COUNT,
      PROGRESS_PASS_DISTANCE_METER,
    } = WAYPOINT_CONFIG;

    const confirmWaypointPassed = (
      waypointIndex: number,
      distanceMeter: number,
    ) => {
      refs.passedWaypointIdxSetRef.current.add(waypointIndex);

      const nextArr = Array.from(refs.passedWaypointIdxSetRef.current).sort(
        (a, b) => a - b,
      );
      setPassedWaypointIndexes(nextArr);

      playTts('tts-waypoint-arrive', ARRIVE_WAYPOINT_TTS_URL, systemVolume);

      refs.isWaypointEnteredRef.current = false;
      refs.waypointCandidateIdxRef.current = -1;
      refs.waypointPassCountRef.current = 0;
    };

    const prevCoord = prevCoordRef.current;
    const updatePrevCoord = () => {
      prevCoordRef.current = currentCoord;
    };

    const currentInstruction =
      refs.instructionList.current[refs.currentIntervalIndex.current];
    const currentRouteEndIndex = currentInstruction?.interval[1] ?? -1;
    const fullPathCoordinateList = refs.fullPathCoordinateList.current;

    if (fullPathCoordinateList.length > 0 && currentRouteEndIndex >= 0) {
      for (let i = 0; i < waypoints.length; i++) {
        if (refs.passedWaypointIdxSetRef.current.has(i)) continue;

        const waypointPathIndex = findNearestPathIndexToPoint(
          fullPathCoordinateList,
          waypoints[i],
        );
        const distanceMeter = getDistanceBetweenCoords(
          currentCoord,
          waypoints[i],
        );
        const hasPassedWaypointByRouteProgress =
          currentRouteEndIndex >= waypointPathIndex &&
          distanceMeter <= PROGRESS_PASS_DISTANCE_METER;

        if (hasPassedWaypointByRouteProgress) {
          confirmWaypointPassed(i, distanceMeter);
          updatePrevCoord();
          return;
        }
      }
    }

    // Case A: 이미 특정 경유지 반경에 진입한 상태 (Exit 감시)
    if (refs.isWaypointEnteredRef.current) {
      const candidateIdx = refs.waypointCandidateIdxRef.current;

      // 방어 코드: 후보 인덱스가 유효하지 않으면 리셋
      if (candidateIdx < 0 || candidateIdx >= waypoints.length) {
        refs.isWaypointEnteredRef.current = false;
        updatePrevCoord();
        return;
      }

      const distanceMeter = getDistanceBetweenCoords(
        currentCoord,
        waypoints[candidateIdx],
      );

      // 아직 탈출 반경(Exit) 안쪽이라면 -> 카운트 초기화하고 대기
      if (distanceMeter < EXIT_RADIUS_METER) {
        refs.waypointPassCountRef.current = 0;
        updatePrevCoord();
        return;
      }

      // 탈출 반경 밖으로 나감 -> 지나침 카운트 증가
      refs.waypointPassCountRef.current = PASS_CONFIRM_COUNT;

      // 카운트 충족 시 "지나침 확정"
      if (refs.waypointPassCountRef.current >= PASS_CONFIRM_COUNT) {
        confirmWaypointPassed(candidateIdx, distanceMeter);
      }
      updatePrevCoord();
      return;
    }

    // Case B: 진입한 경유지가 없는 상태 (Entry 감시)
    // [최적화] 여기서는 아직 안 지나친 경유지 중 "가장 가까운 것" 하나만 찾으면 됨
    let bestIdx = -1;
    let bestDistanceMeter = Number.POSITIVE_INFINITY;

    for (let i = 0; i < waypoints.length; i++) {
      if (refs.passedWaypointIdxSetRef.current.has(i)) continue;

      const directDistanceMeter = getDistanceBetweenCoords(
        currentCoord,
        waypoints[i],
      );
      const pathDistanceMeter = prevCoord
        ? getDistanceFromPointToSegmentMeter(
            waypoints[i],
            prevCoord,
            currentCoord,
          )
        : directDistanceMeter;
      const d = Math.min(directDistanceMeter, pathDistanceMeter);
      if (d < bestDistanceMeter) {
        bestDistanceMeter = d;
        bestIdx = i;
      }
    }

    // 진입 반경 안에 들어왔는지 확인
    if (bestIdx >= 0 && bestDistanceMeter <= ENTRY_RADIUS_METER) {
      refs.isWaypointEnteredRef.current = true;
      refs.waypointCandidateIdxRef.current = bestIdx;
      refs.waypointPassCountRef.current = 0;

      const directDistanceMeter = getDistanceBetweenCoords(
        currentCoord,
        waypoints[bestIdx],
      );
      if (directDistanceMeter >= EXIT_RADIUS_METER) {
        confirmWaypointPassed(bestIdx, directDistanceMeter);
      }
    }
    updatePrevCoord();
  }, [
    isNavigationMode,
    locationTick,
    selectedRouteData,
    isNavigationInitialized,
    systemVolume,
    setPassedWaypointIndexes,
  ]);
};

const getDistanceFromPointToSegmentMeter = (
  point: Coordinate,
  segmentStart: Coordinate,
  segmentEnd: Coordinate,
) => {
  const lat0 = point.lat;
  const meterPerDegLat = 111_320;
  const meterPerDegLng = 111_320 * Math.cos((lat0 * Math.PI) / 180);

  const toXY = (coord: Coordinate) => ({
    x: (coord.lng - point.lng) * meterPerDegLng,
    y: (coord.lat - point.lat) * meterPerDegLat,
  });

  const start = toXY(segmentStart);
  const end = toXY(segmentEnd);
  const abX = end.x - start.x;
  const abY = end.y - start.y;
  const denom = abX * abX + abY * abY;

  if (denom === 0) {
    return getDistanceBetweenCoords(point, segmentStart);
  }

  const t = Math.max(0, Math.min(1, -(start.x * abX + start.y * abY) / denom));
  const projectedX = start.x + abX * t;
  const projectedY = start.y + abY * t;

  return Math.hypot(projectedX, projectedY);
};

const findNearestPathIndexToPoint = (
  pathCoordinateList: [number, number][],
  point: Coordinate,
) => {
  let bestIndex = 0;
  let bestDistanceMeter = Number.POSITIVE_INFINITY;

  pathCoordinateList.forEach(([lng, lat], index) => {
    const distanceMeter = getDistanceBetweenCoords(point, { lat, lng });
    if (distanceMeter < bestDistanceMeter) {
      bestDistanceMeter = distanceMeter;
      bestIndex = index;
    }
  });

  return bestIndex;
};
