import { useEffect, type RefObject } from 'react';

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
import { Coordinates } from '@/features/map/model/map.types';
import { Route, RouteType } from '@/features/routing/model/routing.types';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { ApplyNavigationDataInput } from '@/features/navigation/hooks/useNavigationDataApply';
import { NavigationWalkingPolicy } from '@/shared/model/map.webview.types';

export type UseOffRouteControllerParams = {
  isNavigationMode: boolean;
  isNavigationInitialized: boolean;
  sessionId: string | null;
  locationTick: number | undefined;
  systemVolume: number;
  traveledDistanceMeter: number | undefined | null;
  selectedRouteData: Route | null;
  reroute: (payload: {
    sessionId: string;
    currentLocation: Coordinates;
    travelMode: 'walking' | 'biking';
    remainingWaypoints: Coordinates[];
  }) => Promise<any>;
  recoveryRoute: (payload: {
    sessionId: string;
    currentLocation: Coordinates;
    remainingWaypoints: Coordinates[];
  }) => Promise<any>;
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
    isHandlingOffRouteRef: RefObject<boolean>;
    isStationaryRef: RefObject<boolean>;
    isBikingStateRef: RefObject<boolean>;
    lastOffRouteTimestampRef: RefObject<number | null>;
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
  reroute,
  recoveryRoute,
  applyNavigationData,
  setIsLoadingForOffRoute,
  refs,
}: UseOffRouteControllerParams) => {
  const {
    RECOVERY_TRIGGER_METER,
    REROUTE_TRIGGER_METER,
    MAX_TRIGGER_COUNT,
    COUNT_DECAY,
  } = OFF_ROUTE_CONFIG;

  const {
    WARNING_OFFROUTE_TTS_URL,
    REROUTE_TTS_URL,
    RECOVER_TTS_URL,
    START_TTS_URL,
    FALLBACK_TTS_URL,
  } = TTS_URL_PRESET;

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

      const isOffForRecovery = minDistanceMeter >= RECOVERY_TRIGGER_METER;
      const isOffForReroute = minDistanceMeter >= REROUTE_TRIGGER_METER;
      const isNearByStart = bestIdx === 0;

      const routeType =
        useRouteStore.getState().routeType === 'loop'
          ? RouteType.LOOP
          : RouteType.CONSTANT;

      // ===============================
      // 1️⃣ off 카운트는 "항상" 누적
      // ===============================
      if (routeType === RouteType.LOOP) {
        if (isOffForRecovery || isOffForReroute) {
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
        if (isOffForReroute) {
          refs.rerouteTriggerCount.current = Math.min(
            MAX_TRIGGER_COUNT,
            refs.rerouteTriggerCount.current + 1,
          );
          refs.recoverTriggerCount.current = Math.max(
            0,
            refs.recoverTriggerCount.current - COUNT_DECAY,
          );
        } else if (isOffForRecovery) {
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
      // 2️⃣ TTS (edge-trigger, 정지 아닐 때만)
      // ===============================
      if (!refs.isStationaryRef.current && !refs.isHandlingOffRouteRef.current) {
        if (refs.rerouteTriggerCount.current === 1) {
          playTts(
            'tts-offroute-warning',
            WARNING_OFFROUTE_TTS_URL,
            systemVolume,
          );
        }
        if (refs.recoverTriggerCount.current === 1) {
          playTts(
            'tts-offroute-warning',
            WARNING_OFFROUTE_TTS_URL,
            systemVolume,
          );
        }
      }

      // ===============================
      // 3️⃣ remainingWaypoints (⚠️ 유지)
      // ===============================
      const remainingWaypoints = selectedRouteData?.waypoints
        ?.map((wp, idx) =>
          refs.passedWaypointIdxSetRef.current.has(idx)
            ? null
            : { lat: wp.lat, lng: wp.lng },
        )
        .filter((wp): wp is Coordinates => wp !== null);

      // ===============================
      // 4️⃣ reroute (정지 아닐 때만 실행)
      // ===============================
      if (
        !refs.isStationaryRef.current &&
        !refs.isHandlingOffRouteRef.current &&
        routeType === RouteType.CONSTANT &&
        refs.rerouteTriggerCount.current >= MAX_TRIGGER_COUNT
      ) {
        const shouldWalkingReroute = isNearByStart && !refs.isBikingStateRef.current;
        const shouldBikingReroute = refs.isBikingStateRef.current;

        if (!shouldWalkingReroute && !shouldBikingReroute) return;

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
            travelMode: shouldWalkingReroute ? 'walking' : 'biking',
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
            shouldBikingReroute ? 'only-end' : 'all',
          );

          playTts('tts-offroute-reroute', REROUTE_TTS_URL, systemVolume);
          playTts('tts-navigation-start', START_TTS_URL, systemVolume);
          playTts(
            `tts-actual-${refs.currentIntervalIndex.current}`,
            refs.currentTtsUrl.current ?? FALLBACK_TTS_URL,
            systemVolume,
          );
        } finally {
          refs.isHandlingOffRouteRef.current = false;
          setIsLoadingForOffRoute(false);
        }
      }

      // ===============================
      // 5️⃣ recover (주행 중 + 정지 아닐 때)
      // ===============================
      if (
        !refs.isStationaryRef.current &&
        !refs.isHandlingOffRouteRef.current &&
        refs.isBikingStateRef.current &&
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
            },
            'only-end',
          );

          playTts('tts-offroute-recover', RECOVER_TTS_URL, systemVolume);
          playTts('tts-navigation-start', START_TTS_URL, systemVolume);
          playTts(
            `tts-actual-${refs.currentIntervalIndex.current}`,
            refs.currentTtsUrl.current ?? FALLBACK_TTS_URL,
            systemVolume,
          );
        } finally {
          refs.isHandlingOffRouteRef.current = false;
          setIsLoadingForOffRoute(false);
        }
      }
    };

    (async () => {
      try {
        await judgeOffRoute();
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
  ]);
};
