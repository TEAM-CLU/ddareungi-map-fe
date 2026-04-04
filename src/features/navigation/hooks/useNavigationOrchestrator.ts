import { useCallback, useEffect, useRef, useState } from 'react';
import { useUserInfoQuery } from '@/features/auth/services/user.queries';
import { Coordinate } from '@/shared/model/shared.types';
import { useMapStore } from '@/features/map/stores/useMapStore';
import { useNavigationMessenger } from '@/features/navigation/hooks/useNavigationMessenger';
import {
  IntervalPathData,
  LocationMetaData,
  NavigationInstruction,
} from '@/features/navigation/model/navigation.types';
import { useNavigationDetailModalStore } from '@/features/navigation/stores/useNavigationDetailModalStore';
import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore';
import { useVolumeStore } from '@/features/navigation/stores/useVolumeStore';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { Gender } from '@/shared/model/shared.types';
import { useShallow } from 'zustand/react/shallow';
import { useBookmarkMessenger } from '@/features/bookmark/hooks/useBookmarkMessenger';
import { useNavigationSessionLifecycle } from '@/features/navigation/hooks/useNavigationSessionLifecycle';
import { useNavigationSessionKeepAlive } from '@/features/navigation/hooks/useNavigationSessionKeepAlive';
import { useNavigationDataApply } from '@/features/navigation/hooks/useNavigationDataApply';
import { useTurnController } from '@/features/navigation/hooks/useTurnController';
import { useStationaryState } from '@/features/navigation/hooks/useStationaryState';
import { useWaypointController } from '@/features/navigation/hooks/useWaypointController';
import { useOffRouteController } from '@/features/navigation/hooks/useOffRouteController';
import { useNavigationMetrics } from '@/features/navigation/hooks/useNavigationMetrics';
import { useSystemVolumeSync } from '@/features/navigation/hooks/useSystemVolumeSync';
import { useLocationMetaHistory } from '@/features/navigation/hooks/useLocationMetaHistory';
import { useDestinationArrival } from '@/features/navigation/hooks/useDestinationArrival';
import { useModalStore } from '@/shared/stores/useModalStore';

export const useNavigationOrchestrator = () => {
  const { data: userInfoData } = useUserInfoQuery();
  const userGender = (userInfoData?.data.gender as Gender) ?? 'M';
  const userBirthYear = userInfoData?.data.birthYear ?? null;

  const isMapReady = useMapStore(state => state.isMapReady);
  const selectedRouteData = useRouteStore(state => state.selectedRouteData);
  const locationMetaData = useMyPositionStore(state => state.locationMetaData);
  const locationTick = useMyPositionStore(
    state => state.locationMetaData?.timestamp,
  );

  const {
    isNavigationMode,
    routeId,
    sessionId,
    setSessionId,
    traveledDistanceMeter,
    setTraveledDistance,
    addCaloriesBurned,
    addCarbonSaved,
    setIsNavigationMode,
  } = useNavigationStore(
    useShallow(state => ({
      isNavigationMode: state.isNavigationMode,
      routeId: state.routeId,
      sessionId: state.sessionId,
      setSessionId: state.setSessionId,
      traveledDistanceMeter: state.traveledDistanceMeter,
      setTraveledDistance: state.setTraveledDistanceMeter,
      addCaloriesBurned: state.addCaloriesBurned,
      addCarbonSaved: state.addCarbonSaved,
      setIsNavigationMode: state.setIsNavigationMode,
    })),
  );

  const { systemVolume, setSystemVolume } = useVolumeStore(
    useShallow(state => ({
      systemVolume: state.systemVolume,
      setSystemVolume: state.setSystemVolume,
    })),
  );

  const { setInstructionList, setCurrentIntervalIndex } =
    useNavigationDetailModalStore(
      useShallow(state => ({
        setInstructionList: state.setInstructionList,
        setCurrentIntervalIndex: state.setCurrentIntervalIndex,
      })),
    );

  const { setShowNavigationEndModal, setShowNavigationFinishModal } = useModalStore(
    useShallow(state => ({
      setShowNavigationEndModal: state.setShowNavigationEndModal,
      setShowNavigationFinishModal: state.setShowNavigationFinishModal,
    })),
  );

  const {
    replaceMyLocationMarker,
    drawNavigationPath,
    updateNavigationCurrentInterval,
    clearNavigationPath,
  } = useNavigationMessenger();

  const { turnOffBookmarkMarkers } = useBookmarkMessenger();

  const fullPathCoordinateList = useRef<[number, number][]>([]);
  const pathDataListByInterval = useRef<IntervalPathData[]>([]);
  const instructionList = useRef<NavigationInstruction[]>([]);
  const nextTurnCoordinate = useRef<Coordinate | null>(null);

  const currentIntervalIndex = useRef<number>(0);
  const currentTtsUrl = useRef<string | null>(null);

  const isEnteredRef = useRef<boolean>(false);
  const passCountRef = useRef<number>(0);
  const lastDistanceFromMyPosToNextTurnPosRef = useRef<number | null>(null);
  const prevMyPositionForTurnRef = useRef<Coordinate | null>(null);
  const prevTimestampForTurnRef = useRef<number | null>(null);

  const previewInstructionText = useRef<string>('');
  const previewTtsUrl = useRef<string | null>(null);
  const previewSign = useRef<number | null>(null);
  const previewEnterCount = useRef<number>(0);

  const prevLocationMetaData = useRef<LocationMetaData | null>(null);
  const currentLocationMetaData = useRef<LocationMetaData | null>(null);
  const prevEmaSpeedMps = useRef<number | null>(null);

  const prevTimestampForDistanceRef = useRef<number | null>(null);
  const prevMyPositionForDistanceRef = useRef<Coordinate | null>(null);
  const prevTraveledDistanceMeterRef = useRef<number>(0);
  const routeTraveledBaselineRef = useRef<number | null>(null);
  const prevRemainingDistanceMeterRef = useRef<number>(
    Number.POSITIVE_INFINITY,
  );
  const accumulatedTraveledDistanceRef = useRef<number>(0);

  const prevTimestampForMeasureRef = useRef<number | null>(null);
  const prevTraveledDistanceForMeasureRef = useRef<number | null>(null);

  const recoverTriggerCount = useRef(0);
  const rerouteTriggerCount = useRef(0);
  const hasReroutedRef = useRef(false);
  const isHandlingOffRouteRef = useRef(false);
  const lastOffRouteTimestampRef = useRef<number | null>(null);
  const offRouteJudgeCooldownUntilRef = useRef<number>(0);
  const offRouteTickBusyRef = useRef(false);

  const passedWaypointIdxSetRef = useRef<Set<number>>(new Set());
  const isWaypointEnteredRef = useRef(false);
  const waypointCandidateIdxRef = useRef<number>(-1);
  const waypointPassCountRef = useRef<number>(0);

  const isBikingStateRef = useRef<boolean>(false);
  const bikingStateCountRef = useRef<number>(0);
  const isStationaryRef = useRef<boolean>(false);
  const stationaryCountRef = useRef<number>(0);
  const prevMyPositionForStationaryRef = useRef<Coordinate | null>(null);
  const prevTimestampForStationaryRef = useRef<number | null>(null);

  const [currentInstruction, setCurrentInstruction] =
    useState<NavigationInstruction | null>(null);
  const [eta, setEta] = useState<Date | undefined | null>(null);
  const [remainingDistanceMeter, setRemainingDistance] = useState<
    number | undefined | null
  >(null);
  const [passedWaypointIndexes, setPassedWaypointIndexes] = useState<number[]>(
    [],
  );
  const [isLoadingForOffRoute, setIsLoadingForOffRoute] = useState(false);
  const [isNavigationInitialized, setIsNavigationInitialized] = useState(false);

  useEffect(() => {
    if (!isNavigationMode) return;
    turnOffBookmarkMarkers();
  }, [isNavigationMode, turnOffBookmarkMarkers]);

  // 네비게이션 안전 종료 (크래시 방지용)
  const terminateNavigationSafely = useCallback(() => {
    setIsNavigationMode(false);
    setShowNavigationEndModal(true);
  }, [setIsNavigationMode, setShowNavigationEndModal]);

  // 완전초기화
  const resetAllNavigationState = useCallback(() => {
    replaceMyLocationMarker(true);
    clearNavigationPath();
    setInstructionList([]);
    setCurrentIntervalIndex(0);

    pathDataListByInterval.current = [];
    instructionList.current = [];
    fullPathCoordinateList.current = [];
    nextTurnCoordinate.current = null;
    currentIntervalIndex.current = 0;
    currentTtsUrl.current = null;

    previewInstructionText.current = '';
    previewTtsUrl.current = null;
    previewSign.current = null;
    previewEnterCount.current = 0;
    isEnteredRef.current = false;
    passCountRef.current = 0;
    lastDistanceFromMyPosToNextTurnPosRef.current = null;
    prevMyPositionForTurnRef.current = null;
    prevTimestampForTurnRef.current = null;

    prevTimestampForDistanceRef.current = null;
    prevMyPositionForDistanceRef.current = null;
    prevTraveledDistanceMeterRef.current = 0;
    routeTraveledBaselineRef.current = null;
    prevRemainingDistanceMeterRef.current = Number.POSITIVE_INFINITY;
    accumulatedTraveledDistanceRef.current = 0;
    prevTimestampForMeasureRef.current = null;
    prevTraveledDistanceForMeasureRef.current = null;

    recoverTriggerCount.current = 0;
    rerouteTriggerCount.current = 0;
    hasReroutedRef.current = false;
    isHandlingOffRouteRef.current = false;
    lastOffRouteTimestampRef.current = null;
    offRouteJudgeCooldownUntilRef.current = 0;
    offRouteTickBusyRef.current = false;

    passedWaypointIdxSetRef.current.clear();
    isWaypointEnteredRef.current = false;
    waypointCandidateIdxRef.current = -1;
    waypointPassCountRef.current = 0;

    isBikingStateRef.current = false;
    bikingStateCountRef.current = 0;
    isStationaryRef.current = false;
    stationaryCountRef.current = 0;
    prevMyPositionForStationaryRef.current = null;
    prevTimestampForStationaryRef.current = null;
    prevLocationMetaData.current = null;
    currentLocationMetaData.current = null;
    prevEmaSpeedMps.current = null;

    setSessionId(null);
    setIsNavigationInitialized(false);
    setCurrentInstruction(null);
    setPassedWaypointIndexes([]);
    setIsLoadingForOffRoute(false);
  }, [
    replaceMyLocationMarker,
    clearNavigationPath,
    setInstructionList,
    setCurrentIntervalIndex,
    setSessionId,
    setIsNavigationInitialized,
  ]);

  const { applyNavigationData } = useNavigationDataApply({
    selectedRouteData,
    isMapReady,
    drawNavigationPath,
    setCurrentInstruction,
    setInstructionList,
    setCurrentIntervalIndex,
    onError: terminateNavigationSafely,
    refs: {
      fullPathCoordinateList,
      pathDataListByInterval,
      instructionList,
      nextTurnCoordinate,
      currentIntervalIndex,
      currentTtsUrl,
      previewInstructionText,
      previewTtsUrl,
      previewSign,
      isEnteredRef,
      passCountRef,
      lastDistanceFromMyPosToNextTurnPosRef,
      prevMyPositionForTurnRef,
      prevTimestampForTurnRef,
      previewEnterCount,
      prevTimestampForDistanceRef,
      prevMyPositionForDistanceRef,
      prevTraveledDistanceMeterRef,
      routeTraveledBaselineRef,
      prevRemainingDistanceMeterRef,
      prevTimestampForMeasureRef,
      prevTraveledDistanceForMeasureRef,
    },
  });

  useNavigationSessionLifecycle({
    isNavigationMode,
    routeId,
    isMapReady,
    resetAllNavigationState,
    applyNavigationData,
    setSessionId,
    setIsNavigationInitialized,
    isHandlingOffRouteRef,
  });

  useLocationMetaHistory({
    isNavigationMode,
    isNavigationInitialized,
    locationMetaData,
    locationTick,
    prevLocationMetaData,
    currentLocationMetaData,
  });

  useStationaryState({
    locationMetaData,
    locationTick,
    currentLocationMetaData,
    isStationaryRef,
    stationaryCountRef,
    prevMyPositionForStationaryRef,
    prevTimestampForStationaryRef,
  });

  useTurnController({
    isNavigationMode,
    isNavigationInitialized,
    locationMetaData,
    currentInstruction,
    setCurrentInstruction,
    setCurrentIntervalIndex,
    refs: {
      nextTurnCoordinate,
      currentIntervalIndex,
      instructionList,
      currentTtsUrl,
      previewInstructionText,
      previewTtsUrl,
      previewSign,
      isEnteredRef,
      passCountRef,
      lastDistanceFromMyPosToNextTurnPosRef,
      prevMyPositionForTurnRef,
      prevTimestampForTurnRef,
      previewEnterCount,
      currentLocationMetaData,
    },
  });

  // currentIntervalIndex 변경 시 경로 업데이트 (지나온 구간 회색 처리)
  useEffect(() => {
    if (!isNavigationInitialized || !isMapReady) return;

    const currentIndex = currentIntervalIndex.current;

    if (currentIndex >= 0 && fullPathCoordinateList.current.length > 0) {
      updateNavigationCurrentInterval(currentIndex);
    }
  }, [
    currentInstruction,
    isNavigationInitialized,
    isMapReady,
    updateNavigationCurrentInterval,
  ]);

  useWaypointController({
    isNavigationMode,
    isNavigationInitialized,
    locationMetaData,
    locationTick,
    selectedRouteData,
    systemVolume,
    setPassedWaypointIndexes,
    refs: {
      passedWaypointIdxSetRef,
      isWaypointEnteredRef,
      waypointCandidateIdxRef,
      waypointPassCountRef,
    },
  });

  useOffRouteController({
    isNavigationMode,
    isNavigationInitialized,
    sessionId,
    locationTick,
    systemVolume,
    traveledDistanceMeter,
    selectedRouteData,
    applyNavigationData,
    setIsLoadingForOffRoute,
    refs: {
      currentLocationMetaData,
      pathDataListByInterval,
      currentIntervalIndex,
      currentTtsUrl,
      recoverTriggerCount,
      rerouteTriggerCount,
      hasReroutedRef,
      isHandlingOffRouteRef,
      isStationaryRef,
      isBikingStateRef,
      lastOffRouteTimestampRef,
      offRouteJudgeCooldownUntilRef,
      offRouteTickBusyRef,
      accumulatedTraveledDistanceRef,
      passedWaypointIdxSetRef,
    },
  });

  useNavigationMetrics({
    isNavigationMode,
    isNavigationInitialized,
    locationMetaData,
    locationTick,
    userGender,
    userBirthYear,
    traveledDistanceMeter,
    remainingDistanceMeter,
    setTraveledDistance,
    setRemainingDistance,
    setEta,
    addCaloriesBurned,
    addCarbonSaved,
    onError: terminateNavigationSafely,
    refs: {
      pathDataListByInterval,
      instructionList,
      currentIntervalIndex,
      prevTimestampForDistanceRef,
      prevMyPositionForDistanceRef,
      prevTraveledDistanceMeterRef,
      routeTraveledBaselineRef,
      prevRemainingDistanceMeterRef,
      accumulatedTraveledDistanceRef,
      prevLocationMetaData,
      currentLocationMetaData,
      prevEmaSpeedMps,
      prevTimestampForMeasureRef,
      prevTraveledDistanceForMeasureRef,
      isBikingStateRef,
      bikingStateCountRef,
    },
  });

  useDestinationArrival({
    isNavigationMode,
    isNavigationInitialized,
    locationMetaData,
    locationTick,
    remainingDistanceMeter,
    setIsNavigationMode,
    setShowNavigationEndModal,
    setShowNavigationFinishModal,
    refs: {
      currentIntervalIndex,
      instructionList,
    },
  });

  useSystemVolumeSync(setSystemVolume);

  useNavigationSessionKeepAlive({
    isNavigationMode,
    sessionId,
    isNavigationInitialized,
  });

  return {
    pathDataListByInterval: pathDataListByInterval.current,
    currentIntervalIndex: currentIntervalIndex.current,
    currentTtsUrl: currentTtsUrl.current,
    previewInstructionText: previewInstructionText.current,
    previewTtsUrl: previewTtsUrl.current,
    previewSign: previewSign.current,
    currentInstruction,
    isNavigationMode,
    routeId,
    eta,
    remainingDistanceMeter,
    traveledDistanceMeter,
    isLoadingForOffRoute,
  };
};
