import { useEffect, useRef, type RefObject } from 'react';
import {
  ACCURACY_OK,
  OFF_ROUTE_CONFIG,
  TTS_URL_PRESET,
} from '@/features/navigation/model/navigation.constants';
import {
  IntervalPathData,
  LocationMetaData,
  ApplyNavigationDataInput,
} from '@/features/navigation/model/navigation.types';
import { playTts } from '@/features/navigation/libs/playTts';
import { getMinDistanceInWindow } from '@/features/navigation/utils/getMindistanceInWindow';
import { findClosestCoordIndex } from '@/features/navigation/utils/navigationController';
import { Coordinate } from '@/shared/model/shared.types';
import { Route, RouteType } from '@/features/routing/model/routing.types';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { NavigationWalkingPolicy } from '@/shared/model/map.webview.types';
import { mapOffRouteResponseToApplyInput } from '@/features/navigation/utils/offRouteResponseMapper';
import {
  createInitialOffRouteRecoveryGuardState,
  evaluateRecoveryAvailability,
  getIsMovingTowardRoute,
  lockRecoveryAfterReroute,
  resetOffRouteRecoveryGuardState,
} from '@/features/navigation/utils/offRouteRecoveryGuard';
import {
  useReRouteMutation,
  useReturnToExistingRouteMutation,
} from '../services/navigation.queries';
import { handleCatch } from '@/shared/utils/errorHandler';

export interface UseOffRouteControllerParams {
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
    pathMode?: 'normal' | 'loop-recovery',
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
}

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
  const recoveryGuardStateRef = useRef(
    createInitialOffRouteRecoveryGuardState(),
  );

  useEffect(() => {
    if (isNavigationMode && isNavigationInitialized && sessionId) return;

    resetOffRouteRecoveryGuardState(recoveryGuardStateRef.current);
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

      const targetCoord = intervalCoordinateList[bestIdx] ?? null;
      const isMovingTowardRoute = getIsMovingTowardRoute(
        recoveryGuardStateRef.current,
        myPosition,
        targetCoord,
        tickNowMs,
      );

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

      // 정책: 원형경로는 off-route 재탐색/복귀를 수행하지 않음
      if (routeType === RouteType.LOOP) {
        refs.recoverTriggerCount.current = 0;
        refs.rerouteTriggerCount.current = 0;
        return;
      }

      const canTriggerReroute =
        routeType === RouteType.CONSTANT &&
        !refs.hasReroutedRef.current &&
        isEarlyRerouteWindow;
      const recoveryWalkingPolicy: NavigationWalkingPolicy = 'only-end';

      const { canUseRecovery } = evaluateRecoveryAvailability({
        state: recoveryGuardStateRef.current,
        tickNowMs,
        minDistanceMeter,
        recoveryTriggerMeter: RECOVERY_TRIGGER_METER,
        maxTriggerCount: MAX_TRIGGER_COUNT,
        countDecay: COUNT_DECAY,
        isMovingTowardRoute,
      });

      // ===============================
      // 1. off 카운트는 "항상" 누적
      // ===============================
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

          applyNavigationData(mapOffRouteResponseToApplyInput(response.data), 'all');

          refs.hasReroutedRef.current = true;
          lockRecoveryAfterReroute(
            recoveryGuardStateRef.current,
            tickNowMs,
            POST_REROUTE_RECOVERY_LOCK_MS,
          );
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
            mapOffRouteResponseToApplyInput(response.data),
            recoveryWalkingPolicy,
            'normal',
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
