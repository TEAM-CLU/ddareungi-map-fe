import { useEffect, useRef, type RefObject } from 'react';
import {
  ACCURACY_OK,
  OFF_ROUTE_CONFIG,
  TTS_URL_PRESET,
} from '@/features/navigation/model/navigation.constants';
import {
  IntervalPathData,
  LocationMetaData,
} from '@/features/navigation/model/navigation.types';
import { playTts } from '@/features/navigation/libs/playTts';
import { getMinDistanceInWindow } from '@/features/navigation/utils/getMindistanceInWindow';
import { findClosestCoordIndex } from '@/features/navigation/utils/navigationController';
import { calculateMotionVector } from '@/features/navigation/utils/calculateMotionVector';
import { Coordinate } from '@/shared/model/shared.types';
import { Route, RouteType } from '@/features/routing/model/routing.types';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { ApplyNavigationDataInput } from '@/features/navigation/hooks/useNavigationDataApply';
import { NavigationWalkingPolicy } from '@/shared/model/map.webview.types';
import {
  useReRouteMutation,
  useReturnToExistingRouteMutation,
} from '../services/navigation.queries';
import { handleCatch } from '@/shared/utils/errorHandler';

export type UseOffRouteControllerParams = {
  isNavigationMode: boolean;
  isNavigationInitialized: boolean;
  sessionId: string | null;
  locationTick: number | undefined;
  systemVolume: number;
  traveledDistanceMeter: number | undefined | null;
  selectedRouteData: Route | null;
  applyNavigationData: (
    data: ApplyNavigationDataInput,
    walkingPolicy?: NavigationWalkingPolicy,
  ) => void;
  setIsLoadingForOffRoute: (v: boolean) => void;
  refs: {
    currentLocationMetaData: RefObject<LocationMetaData | null>;
    pathDataListByInterval: RefObject<IntervalPathData[]>;
    currentIntervalIndex: RefObject<number>;
    currentTtsUrl: RefObject<string | null>;
    recoverTriggerCount: RefObject<number>;
    rerouteTriggerCount: RefObject<number>;
    hasReroutedRef: RefObject<boolean>;
    isHandlingOffRouteRef: RefObject<boolean>;
    isStationaryRef: RefObject<boolean>;
    isBikingStateRef: RefObject<boolean>;
    lastOffRouteTimestampRef: RefObject<number | null>;
    offRouteJudgeCooldownUntilRef: RefObject<number>;
    offRouteTickBusyRef: RefObject<boolean>;
    accumulatedTraveledDistanceRef: RefObject<number>;
    passedWaypointIdxSetRef: RefObject<Set<number>>;
  };
};

export const useOffRouteController = ({
  isNavigationMode,
  isNavigationInitialized,
  sessionId,
  locationTick,
  systemVolume,
  traveledDistanceMeter,
  selectedRouteData,
  applyNavigationData,
  setIsLoadingForOffRoute,
  refs,
}: UseOffRouteControllerParams) => {
  const { mutateAsync: reroute } = useReRouteMutation();
  const { mutateAsync: recoveryRoute } = useReturnToExistingRouteMutation();

  const {
    RECOVERY_TRIGGER_METER,
    REROUTE_TRIGGER_METER,
    MAX_TRIGGER_COUNT,
    COUNT_DECAY,
    REROUTE_MAX_TRAVELED_METER,
    REROUTE_MAX_INTERVAL_INDEX,
    POST_APPLY_JUDGE_COOLDOWN_MS,
    POST_REROUTE_RECOVERY_LOCK_MS,
  } = OFF_ROUTE_CONFIG;

  const {
    WARNING_OFFROUTE_TTS_URL,
    REROUTE_TTS_URL,
    RECOVER_TTS_URL,
    START_TTS_URL,
    FALLBACK_TTS_URL,
  } = TTS_URL_PRESET;

  // reroute 직후 recovery 재발동 제어
  const recoveryLockUntilRef = useRef<number>(0);
  const recoveryUnlockCountRef = useRef<number>(0);
  const shouldRequireRecoveryUnlockRef = useRef<boolean>(false);
  const isRecoveryUnlockedRef = useRef<boolean>(false);
  const prevMyPositionForOffRouteRef = useRef<Coordinate | null>(null);
  const prevTimestampForOffRouteRef = useRef<number | null>(null);

  useEffect(() => {
    if (isNavigationMode && isNavigationInitialized && sessionId) return;

    recoveryLockUntilRef.current = 0;
    recoveryUnlockCountRef.current = 0;
    shouldRequireRecoveryUnlockRef.current = false;
    isRecoveryUnlockedRef.current = false;
    prevMyPositionForOffRouteRef.current = null;
    prevTimestampForOffRouteRef.current = null;
  }, [isNavigationMode, isNavigationInitialized, sessionId]);

  // 경로복귀 (OFF-ROUTE JUDGE)
  useEffect(() => {
    if (
      !isNavigationMode ||
      !refs.currentLocationMetaData.current ||
      !sessionId ||
      !isNavigationInitialized
    )
      return;

    const locationMeta = refs.currentLocationMetaData.current;

    const timestamp =
      typeof locationMeta.timestamp === 'number'
        ? locationMeta.timestamp
        : null;

    if (timestamp !== null) {
      if (refs.lastOffRouteTimestampRef.current === timestamp) return;
      refs.lastOffRouteTimestampRef.current = timestamp;
    }
    const tickNowMs = timestamp ?? Date.now();
    if (tickNowMs < refs.offRouteJudgeCooldownUntilRef.current) return;

    const myPosition = locationMeta.coordinate;
    const accuracy = locationMeta.accuracy;
    if (typeof accuracy !== 'number' || accuracy > ACCURACY_OK) return;

    if (refs.offRouteTickBusyRef.current) return;
    refs.offRouteTickBusyRef.current = true;

    const judgeOffRoute = async () => {
      const intervalCoordinateList =
        refs.pathDataListByInterval.current[refs.currentIntervalIndex.current]
          ?.coordinateList ?? [];

      if (intervalCoordinateList.length < 2) return;

      const bestIdx = findClosestCoordIndex(myPosition, intervalCoordinateList);
      if (bestIdx < 0) return;

      const minDistanceMeter = getMinDistanceInWindow(
        myPosition,
        intervalCoordinateList,
        bestIdx,
      );

      // 현재 인터벌의 nearest 좌표를 기준으로 접근/이탈 방향성 계산
      const prevPosition = prevMyPositionForOffRouteRef.current;
      const prevTimestamp = prevTimestampForOffRouteRef.current;
      const targetCoord = intervalCoordinateList[bestIdx];
      let isMovingTowardRoute = false;

      if (prevPosition && prevTimestamp != null && targetCoord) {
        const dtSec = Math.max(0.001, (tickNowMs - prevTimestamp) / 1000);
        const { dot } = calculateMotionVector(
          prevPosition,
          myPosition,
          targetCoord,
          dtSec,
        );
        isMovingTowardRoute = dot > 0;
      }

      prevMyPositionForOffRouteRef.current = myPosition;
      prevTimestampForOffRouteRef.current = tickNowMs;

      const isOffForRecovery = minDistanceMeter >= RECOVERY_TRIGGER_METER;
      const isOffForReroute = minDistanceMeter >= REROUTE_TRIGGER_METER;
      const isNearByStart = bestIdx === 0;
      const isEarlyRerouteWindow =
        isNearByStart &&
        refs.currentIntervalIndex.current <= REROUTE_MAX_INTERVAL_INDEX &&
        (traveledDistanceMeter ?? 0) <= REROUTE_MAX_TRAVELED_METER;

      const routeType =
        useRouteStore.getState().routeType === 'loop'
          ? RouteType.LOOP
          : RouteType.CONSTANT;
      const canTriggerReroute =
        routeType === RouteType.CONSTANT &&
        !refs.hasReroutedRef.current &&
        isEarlyRerouteWindow;
      const recoveryWalkingPolicy: NavigationWalkingPolicy =
        routeType === RouteType.LOOP ? 'all' : 'only-end';

      // reroute 직후 30초는 recovery를 강제 잠금
      const isRecoveryLockActive = tickNowMs < recoveryLockUntilRef.current;

      // lock 해제 후에는 "3회 연속 접근(방향벡터 + 근접)"일 때만 recovery 잠금 해제
      if (
        shouldRequireRecoveryUnlockRef.current &&
        !isRecoveryLockActive &&
        !isRecoveryUnlockedRef.current
      ) {
        const isRecoveryUnlockCandidate =
          minDistanceMeter <= RECOVERY_TRIGGER_METER && isMovingTowardRoute;

        if (isRecoveryUnlockCandidate) {
          recoveryUnlockCountRef.current = Math.min(
            MAX_TRIGGER_COUNT,
            recoveryUnlockCountRef.current + 1,
          );
        } else {
          recoveryUnlockCountRef.current = Math.max(
            0,
            recoveryUnlockCountRef.current - COUNT_DECAY,
          );
        }

        if (recoveryUnlockCountRef.current >= MAX_TRIGGER_COUNT) {
          isRecoveryUnlockedRef.current = true;
          shouldRequireRecoveryUnlockRef.current = false;
          recoveryUnlockCountRef.current = 0;
        }
      }

      const canUseRecovery =
        !isRecoveryLockActive &&
        (!shouldRequireRecoveryUnlockRef.current ||
          isRecoveryUnlockedRef.current);

      // ===============================
      // 1. off 카운트는 "항상" 누적
      // ===============================
      if (routeType === RouteType.LOOP) {
        if ((isOffForRecovery || isOffForReroute) && canUseRecovery) {
          refs.recoverTriggerCount.current = Math.min(
            MAX_TRIGGER_COUNT,
            refs.recoverTriggerCount.current + 1,
          );
        } else {
          refs.recoverTriggerCount.current = Math.max(
            0,
            refs.recoverTriggerCount.current - COUNT_DECAY,
          );
        }
      } else {
        if (isOffForReroute && canTriggerReroute) {
          refs.rerouteTriggerCount.current = Math.min(
            MAX_TRIGGER_COUNT,
            refs.rerouteTriggerCount.current + 1,
          );
          refs.recoverTriggerCount.current = Math.max(
            0,
            refs.recoverTriggerCount.current - COUNT_DECAY,
          );
        } else if ((isOffForRecovery || isOffForReroute) && canUseRecovery) {
          refs.recoverTriggerCount.current = Math.min(
            MAX_TRIGGER_COUNT,
            refs.recoverTriggerCount.current + 1,
          );
          refs.rerouteTriggerCount.current = Math.max(
            0,
            refs.rerouteTriggerCount.current - COUNT_DECAY,
          );
        } else {
          refs.recoverTriggerCount.current = Math.max(
            0,
            refs.recoverTriggerCount.current - COUNT_DECAY,
          );
          refs.rerouteTriggerCount.current = Math.max(
            0,
            refs.rerouteTriggerCount.current - COUNT_DECAY,
          );
        }
      }

      // ===============================
      // 2. TTS (edge-trigger, 정지 아닐 때만)
      // ===============================
      if (
        !refs.isStationaryRef.current &&
        !refs.isHandlingOffRouteRef.current
      ) {
        if (
          refs.rerouteTriggerCount.current === 1 ||
          refs.recoverTriggerCount.current === 1
        ) {
          playTts(
            'tts-offroute-warning',
            WARNING_OFFROUTE_TTS_URL,
            systemVolume,
          );
        }
      }

      // ===============================
      // 3. remainingWaypoints
      // ===============================
      const remainingWaypoints = selectedRouteData?.waypoints
        ?.map((wp, idx) =>
          refs.passedWaypointIdxSetRef.current.has(idx)
            ? null
            : { lat: wp.lat, lng: wp.lng },
        )
        .filter((wp): wp is Coordinate => wp !== null);

      // ===============================
      // 4. reroute (정지 아닐 때만 실행)
      // ===============================
      if (
        !refs.isStationaryRef.current &&
        !refs.isHandlingOffRouteRef.current &&
        canTriggerReroute &&
        refs.rerouteTriggerCount.current >= MAX_TRIGGER_COUNT
      ) {
        refs.isHandlingOffRouteRef.current = true;
        setIsLoadingForOffRoute(true);
        refs.rerouteTriggerCount.current = 0;
        refs.recoverTriggerCount.current = 0;

        if (traveledDistanceMeter != null) {
          refs.accumulatedTraveledDistanceRef.current = traveledDistanceMeter;
        }

        try {
          const response = await reroute({
            sessionId,
            currentLocation: myPosition,
            // 초기 재탐색은 전체 경로(출발 도보 포함)로 재구성
            travelMode: 'walking',
            remainingWaypoints: remainingWaypoints ?? [],
          });

          applyNavigationData(
            {
              coordinates: response.data.coordinates,
              instructions: response.data.instructions,
              startStation: response.data.startStation
                ? {
                    lat: response.data.startStation.location.lat,
                    lng: response.data.startStation.location.lng,
                    stationId: response.data.startStation.stationId,
                    stationName: response.data.startStation.stationName,
                  }
                : undefined,
              endStation: response.data.endStation
                ? {
                    lat: response.data.endStation.location.lat,
                    lng: response.data.endStation.location.lng,
                    stationId: response.data.endStation.stationId,
                    stationName: response.data.endStation.stationName,
                  }
                : undefined,
              waypoints: response.data.waypoints
                ? response.data.waypoints.map(
                    (wp: { lng: number; lat: number }) =>
                      [wp.lng, wp.lat] as [number, number],
                  )
                : undefined,
            },
            'all',
          );

          refs.hasReroutedRef.current = true;
          recoveryLockUntilRef.current =
            tickNowMs + POST_REROUTE_RECOVERY_LOCK_MS;
          shouldRequireRecoveryUnlockRef.current = true;
          isRecoveryUnlockedRef.current = false;
          recoveryUnlockCountRef.current = 0;
          refs.offRouteJudgeCooldownUntilRef.current =
            tickNowMs + POST_APPLY_JUDGE_COOLDOWN_MS;

          playTts('tts-offroute-reroute', REROUTE_TTS_URL, systemVolume);
          playTts('tts-navigation-start', START_TTS_URL, systemVolume);
          playTts(
            `tts-actual-${refs.currentIntervalIndex.current}`,
            refs.currentTtsUrl.current ?? FALLBACK_TTS_URL,
            systemVolume,
          );
        } catch (error) {
          handleCatch(error, {
            mode: 'toast',
          });
        } finally {
          refs.isHandlingOffRouteRef.current = false;
          setIsLoadingForOffRoute(false);
        }
      }

      // ===============================
      // 5. recover (주행 중 + 정지 아닐 때)
      // ===============================
      if (
        !refs.isStationaryRef.current &&
        !refs.isHandlingOffRouteRef.current &&
        canUseRecovery &&
        refs.recoverTriggerCount.current >= MAX_TRIGGER_COUNT
      ) {
        refs.isHandlingOffRouteRef.current = true;
        setIsLoadingForOffRoute(true);
        refs.recoverTriggerCount.current = 0;
        refs.rerouteTriggerCount.current = 0;

        if (traveledDistanceMeter != null) {
          refs.accumulatedTraveledDistanceRef.current = traveledDistanceMeter;
        }

        try {
          const response = await recoveryRoute({
            sessionId,
            currentLocation: myPosition,
            remainingWaypoints: remainingWaypoints ?? [],
          });

          applyNavigationData(
            {
              coordinates: response.data.coordinates,
              instructions: response.data.instructions,
              startStation: response.data.startStation
                ? {
                    lat: response.data.startStation.location.lat,
                    lng: response.data.startStation.location.lng,
                    stationId: response.data.startStation.stationId,
                    stationName: response.data.startStation.stationName,
                  }
                : undefined,
              endStation: response.data.endStation
                ? {
                    lat: response.data.endStation.location.lat,
                    lng: response.data.endStation.location.lng,
                    stationId: response.data.endStation.stationId,
                    stationName: response.data.endStation.stationName,
                  }
                : undefined,
              waypoints: response.data.waypoints
                ? response.data.waypoints.map(
                    (wp: { lng: number; lat: number }) =>
                      [wp.lng, wp.lat] as [number, number],
                  )
                : undefined,
            },
            recoveryWalkingPolicy,
          );
          refs.hasReroutedRef.current = true;
          refs.offRouteJudgeCooldownUntilRef.current =
            tickNowMs + POST_APPLY_JUDGE_COOLDOWN_MS;

          playTts('tts-offroute-recover', RECOVER_TTS_URL, systemVolume);
          playTts('tts-navigation-start', START_TTS_URL, systemVolume);
          playTts(
            `tts-actual-${refs.currentIntervalIndex.current}`,
            refs.currentTtsUrl.current ?? FALLBACK_TTS_URL,
            systemVolume,
          );
        } catch (error) {
          handleCatch(error, {
            mode: 'toast',
          });
        } finally {
          refs.isHandlingOffRouteRef.current = false;
          setIsLoadingForOffRoute(false);
        }
      }
    };

    (async () => {
      try {
        await judgeOffRoute();
      } catch (error) {
        handleCatch(error, { mode: 'silent' });
      } finally {
        refs.offRouteTickBusyRef.current = false;
      }
    })();
  }, [
    isNavigationMode,
    locationTick,
    sessionId,
    isNavigationInitialized,
    systemVolume,
    traveledDistanceMeter,
    reroute,
    recoveryRoute,
  ]);
};
