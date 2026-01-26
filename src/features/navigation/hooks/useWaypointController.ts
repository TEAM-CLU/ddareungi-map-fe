import { useEffect, type RefObject } from 'react';
import {
  ACCURACY_OK,
  TTS_URL_PRESET,
  WAYPOINT_CONFIG,
} from '@/features/navigation/model/navigation.constants';
import { LocationMetaData } from '@/features/navigation/model/navigation.types';
import { playTts } from '@/features/navigation/libs/playTts';
import { Route } from '@/features/routing/model/routing.types';
import { getDistanceBetweenCoords } from '@/shared/utils/measure';

export type UseWaypointControllerParams = {
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
  };
};

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
    if (typeof currentAccuracy !== 'number' || currentAccuracy > ACCURACY_OK) {
      return;
    }

    // 3. 모든 경유지 다 지나쳤으면 끝
    if (refs.passedWaypointIdxSetRef.current.size >= waypoints.length) return;

    const { ENTRY_RADIUS_METER, EXIT_RADIUS_METER, PASS_CONFIRM_COUNT } =
      WAYPOINT_CONFIG;

    // Case A: 이미 특정 경유지 반경에 진입한 상태 (Exit 감시)
    if (refs.isWaypointEnteredRef.current) {
      const candidateIdx = refs.waypointCandidateIdxRef.current;

      // 방어 코드: 후보 인덱스가 유효하지 않으면 리셋
      if (candidateIdx < 0 || candidateIdx >= waypoints.length) {
        refs.isWaypointEnteredRef.current = false;
        return;
      }

      const distanceMeter = getDistanceBetweenCoords(
        currentCoord,
        waypoints[candidateIdx],
      );

      // 아직 탈출 반경(Exit) 안쪽이라면 -> 카운트 초기화하고 대기
      if (distanceMeter < EXIT_RADIUS_METER) {
        refs.waypointPassCountRef.current = 0;
        return;
      }

      // 탈출 반경 밖으로 나감 -> 지나침 카운트 증가
      refs.waypointPassCountRef.current += 1;

      // 카운트 충족 시 "지나침 확정"
      if (refs.waypointPassCountRef.current >= PASS_CONFIRM_COUNT) {
        refs.passedWaypointIdxSetRef.current.add(candidateIdx);

        // 상태 업데이트 (오름차순 정렬)
        const nextArr = Array.from(refs.passedWaypointIdxSetRef.current).sort(
          (a, b) => a - b,
        );
        setPassedWaypointIndexes(nextArr);

        // 안내 방송
        playTts('tts-waypoint-arrive', ARRIVE_WAYPOINT_TTS_URL, systemVolume);

        // 상태 리셋 (다음 경유지 찾을 준비)
        refs.isWaypointEnteredRef.current = false;
        refs.waypointCandidateIdxRef.current = -1;
        refs.waypointPassCountRef.current = 0;
      }
      return;
    }

    // Case B: 진입한 경유지가 없는 상태 (Entry 감시)
    // [최적화] 여기서는 아직 안 지나친 경유지 중 "가장 가까운 것" 하나만 찾으면 됨
    let bestIdx = -1;
    let bestDistanceMeter = Number.POSITIVE_INFINITY;

    for (let i = 0; i < waypoints.length; i++) {
      if (refs.passedWaypointIdxSetRef.current.has(i)) continue;

      const d = getDistanceBetweenCoords(currentCoord, waypoints[i]);
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
    }
  }, [
    isNavigationMode,
    locationTick,
    selectedRouteData,
    isNavigationInitialized,
    systemVolume,
    setPassedWaypointIndexes,
  ]);
};
