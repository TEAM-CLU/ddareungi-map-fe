import { useEffect, type RefObject } from 'react';

import { Coordinates } from '@/features/map/model/map.types';
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
    if (
      !isNavigationMode ||
      !locationMetaData ||
      !selectedRouteData ||
      !isNavigationInitialized
    )
      return;

    const myPosition = locationMetaData.coordinate;
    const positionAccuracy = locationMetaData.accuracy;
    if (typeof positionAccuracy !== 'number') return;
    if (positionAccuracy > ACCURACY_OK) return;

    const waypoints: Coordinates[] = selectedRouteData.waypoints ?? [];
    if (waypoints.length === 0) return;

    // 이미 다 지나쳤으면 끝
    if (refs.passedWaypointIdxSetRef.current.size >= waypoints.length) return;

    // 아직 안 지나친 waypoint 중 "가장 가까운 것" 찾기
    let bestIdx = -1;
    let bestDistanceMeter = Number.POSITIVE_INFINITY;

    for (let i = 0; i < waypoints.length; i++) {
      if (refs.passedWaypointIdxSetRef.current.has(i)) continue;

      const distanceMeter = getDistanceBetweenCoords(myPosition, waypoints[i]);
      if (distanceMeter < bestDistanceMeter) {
        bestDistanceMeter = distanceMeter;
        bestIdx = i;
      }
    }

    if (bestIdx < 0) return;

    const ENTRY_METER = WAYPOINT_CONFIG.ENTRY_RADIUS_METER;
    const EXIT_METER = WAYPOINT_CONFIG.EXIT_RADIUS_METER;
    const PASS_CONFIRM = WAYPOINT_CONFIG.PASS_CONFIRM_COUNT;

    // 1) entry: 반경 안으로 들어오면 "이번 후보 waypoint"를 고정
    if (!refs.isWaypointEnteredRef.current && bestDistanceMeter <= ENTRY_METER) {
      refs.isWaypointEnteredRef.current = true;
      refs.waypointCandidateIdxRef.current = bestIdx;
      refs.waypointPassCountRef.current = 0;
      return;
    }

    // entry 상태가 아니면 종료
    if (!refs.isWaypointEnteredRef.current) return;

    const candidateIdx = refs.waypointCandidateIdxRef.current;
    if (candidateIdx < 0) {
      refs.isWaypointEnteredRef.current = false;
      return;
    }

    // 후보 waypoint 기준 거리로 다시 측정 (bestIdx가 바뀌면 흔들리니까 "후보 고정"이 중요)
    const candidateDistanceMeter = getDistanceBetweenCoords(
      myPosition,
      waypoints[candidateIdx],
    );

    // 2) exit: 후보에서 멀어졌으면 "지나침 후보" 카운트
    if (candidateDistanceMeter >= EXIT_METER) {
      refs.waypointPassCountRef.current += 1;

      if (refs.waypointPassCountRef.current < PASS_CONFIRM) return;

      // 지나침 확정
      refs.passedWaypointIdxSetRef.current.add(candidateIdx);

      // 원하는 결과값: 지나친 모든 waypoint index
      const nextArr = Array.from(refs.passedWaypointIdxSetRef.current).sort(
        (a, b) => a - b,
      );
      setPassedWaypointIndexes(nextArr);

      playTts('tts-waypoint-arrive', ARRIVE_WAYPOINT_TTS_URL, systemVolume);

      // 상태 리셋
      refs.isWaypointEnteredRef.current = false;
      refs.waypointCandidateIdxRef.current = -1;
      refs.waypointPassCountRef.current = 0;
      return;
    }

    // 3) 아직 exit 아니면 passCount는 감쇠/리셋 (튐 방지)
    refs.waypointPassCountRef.current = 0;
  }, [isNavigationMode, locationTick, selectedRouteData, isNavigationInitialized]);
};
