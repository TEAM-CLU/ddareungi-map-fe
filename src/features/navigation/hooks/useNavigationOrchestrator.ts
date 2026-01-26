import { useCallback, useEffect, useRef, useState } from 'react';
import { travelMode } from './../model/navigation.types';
import { useUserInfoQuery } from '@/features/auth/services/user.queries';
import { Coordinates } from '@/features/map/model/map.types';
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

export const useNavigationOrchestrator = () => {
  const { data: userInfoData } = useUserInfoQuery();
  const userGender = userInfoData?.data.gender as Gender;

  const {
    replaceMyLocationMarker,
    drawNavigationPath,
    updateNavigationCurrentInterval,
    clearNavigationPath,
  } = useNavigationMessenger();

  const isMapReady = useMapStore(state => state.isMapReady);

  const { isNavigationMode, routeId, addCaloriesBurned, addCarbonSaved } =
    useNavigationStore(
      useShallow(state => ({
        isNavigationMode: state.isNavigationMode,
        routeId: state.routeId,
        addCaloriesBurned: state.addCaloriesBurned,
        addCarbonSaved: state.addCarbonSaved,
      })),
    );
  // 지시 배너 업데이트 기준: 내 위치가 다음 턴 좌표에 가까워지면 다음 지시로 업데이트
  const locationMetaData = useMyPositionStore(state => state.locationMetaData);

  const nextTurnCoordinate = useRef<Coordinates | null>(null);

  //  네비게이션 경로 생성 및 실시간 업데이트용
  const fullPathCoordinateList = useRef<[number, number][]>([]);
  const pathDataListByInterval = useRef<IntervalPathData[]>([]);

  // 지시 및 현재 지시
  const instructionList = useRef<NavigationInstruction[]>([]);
  const [currentInstruction, setCurrentInstruction] =
    useState<NavigationInstruction | null>(null);

  // 네비게이션 컨트롤러 필요 안내
  const prevLocationMetaData = useRef<LocationMetaData | null>(null);
  const currentLocationMetaData = useRef<LocationMetaData | null>(null);
  const prevEmaSpeedMps = useRef<number | null>(null);
  const [eta, setEta] = useState<Date | undefined | null>(null);
  const [remainingDistanceMeter, setRemainingDistance] = useState<
    number | undefined | null
  >(null);
  const {
    traveledDistanceMeter,
    setTraveledDistance,
    sessionId,
    setSessionId,
  } = useNavigationStore(
    useShallow(state => ({
      traveledDistanceMeter: state.traveledDistanceMeter,
      setTraveledDistance: state.setTraveledDistanceMeter,
      sessionId: state.sessionId,
      setSessionId: state.setSessionId,
    })),
  );
  const currentTtsUrl = useRef<string | null>(null);

  // 턴 진입/지나침 판정용 상태
  const isEnteredRef = useRef<boolean>(false);
  const passCountRef = useRef<number>(0);
  const lastDistanceFromMyPosToNextTurnPosRef = useRef<number | null>(null);
  const prevMyPositionForTurnRef = useRef<Coordinates | null>(null);
  const prevTimestampForTurnRef = useRef<number | null>(null);
  const previewInstructionText = useRef<string>('');
  const previewTtsUrl = useRef<string | null>(null);
  const previewSign = useRef<number | null>(null);
  const previewEnterCount = useRef<number>(0);

  // 경로 복귀
  const recoverTriggerCount = useRef(0);
  const rerouteTriggerCount = useRef(0);
  const isHandlingOffRouteRef = useRef(false);
  const [isLoadingForOffRoute, setIsLoadingForOffRoute] = useState(false);
  const lastOffRouteTimestampRef = useRef<number | null>(null);
  const offRouteTickBusyRef = useRef(false);

  // 경유지 지나침 판단
  const selectedRouteData = useRouteStore(state => state.selectedRouteData);

  // 지나친 waypoint index들을 누적 (원하는 결과)
  const passedWaypointIdxSetRef = useRef<Set<number>>(new Set());
  const [passedWaypointIndexes, setPassedWaypointIndexes] = useState<number[]>(
    [],
  );

  // waypoint 상태(entered / lastNearest / count)
  const isWaypointEnteredRef = useRef(false);
  const waypointCandidateIdxRef = useRef<number>(-1);
  const waypointPassCountRef = useRef<number>(0);

  // 현재 인터벌 기준 남은 거리, 예상 도착시간 계산, 소요거리용
  const currentIntervalIndex = useRef<number>(0);
  const prevTimestampForDistanceRef = useRef<number | null>(null);
  const prevMyPositionForDistanceRef = useRef<Coordinates | null>(null);
  // 정지 판정용 별도 prev refs (거리/속도 계산용 prev와 분리)
  const prevTimestampForStationaryRef = useRef<number | null>(null);
  const prevMyPositionForStationaryRef = useRef<Coordinates | null>(null);
  const prevTraveledDistanceMeterRef = useRef<number>(0);
  const prevRemainingDistanceMeterRef = useRef<number>(
    Number.POSITIVE_INFINITY,
  );

  // 재탐색 시 소요거리 누적용
  const accumulatedTraveledDistanceRef = useRef<number>(0);

  // 칼로리, 탄소 저감 측정용
  const prevTimestampForMeasureRef = useRef<number | null>(null);
  const prevTraveledDistanceForMeasureRef = useRef<number | null>(null);

  // 주행 상태 추적용 (단순 속도가 아닌 지속적 주행 여부)
  const isBikingStateRef = useRef<boolean>(false);
  const bikingStateCountRef = useRef<number>(0);

  // 정지 상태 추적용 (신호 대기 등 짧은 정지 감지)
  const isStationaryRef = useRef<boolean>(false);
  const stationaryCountRef = useRef<number>(0);

  // 볼륨 상태
  const { systemVolume, setSystemVolume } = useVolumeStore(
    useShallow(state => ({
      systemVolume: state.systemVolume,
      setSystemVolume: state.setSystemVolume,
    })),
  );

  // 네비게이션 디테일 모달 계산용
  const { setInstructionList, setCurrentIntervalIndex } =
    useNavigationDetailModalStore(
      useShallow(state => ({
        setInstructionList: state.setInstructionList,
        setCurrentIntervalIndex: state.setCurrentIntervalIndex,
      })),
    );

  // 초기화 완료 트리거
  const [isNavigationInitialized, setIsNavigationInitialized] = useState(false);

  // 틱 트리거
  const locationTick = useMyPositionStore(
    state => state.locationMetaData?.timestamp,
  );

  // 이동수단 분류용
  const travelModeRef = useRef<travelMode>('walking');

  // 즐겨찾기 마커 제거
  const { turnOffBookmarkMarkers } = useBookmarkMessenger();

  useEffect(() => {
    if (!isNavigationMode) return;

    turnOffBookmarkMarkers();
  }, [isNavigationMode]);

  // 완전초기화
  const resetAllNavigationState = useCallback(() => {
    replaceMyLocationMarker(true);
    clearNavigationPath();
    pathDataListByInterval.current = [];
    instructionList.current = [];
    fullPathCoordinateList.current = [];
    setSessionId(null);
    setCurrentInstruction(null);
    nextTurnCoordinate.current = null;
    currentIntervalIndex.current = 0;
    currentTtsUrl.current = null;
    previewInstructionText.current = '';
    previewTtsUrl.current = null;
    previewSign.current = null;
    previewEnterCount.current = 0;
    recoverTriggerCount.current = 0;
    rerouteTriggerCount.current = 0;
    passedWaypointIdxSetRef.current.clear();
    setPassedWaypointIndexes([]);
    isHandlingOffRouteRef.current = false;
    setIsLoadingForOffRoute(false);
    isWaypointEnteredRef.current = false;
    waypointCandidateIdxRef.current = -1;
    waypointPassCountRef.current = 0;
    prevTimestampForDistanceRef.current = null;
    prevMyPositionForDistanceRef.current = null;
    prevTraveledDistanceMeterRef.current = 0;
    prevRemainingDistanceMeterRef.current = Number.POSITIVE_INFINITY;
    accumulatedTraveledDistanceRef.current = 0;
    prevTimestampForMeasureRef.current = null;
    prevTraveledDistanceForMeasureRef.current = null;
    isBikingStateRef.current = false;
    bikingStateCountRef.current = 0;
    isStationaryRef.current = false;
    stationaryCountRef.current = 0;
    prevMyPositionForStationaryRef.current = null;
    prevTimestampForStationaryRef.current = null;
  }, [
    replaceMyLocationMarker,
    clearNavigationPath,
    setSessionId,
    setCurrentInstruction,
  ]);

  const { applyNavigationData } = useNavigationDataApply({
    selectedRouteData,
    isMapReady,
    drawNavigationPath,
    setCurrentInstruction,
    setInstructionList,
    setCurrentIntervalIndex,
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

  // currentIntervalIndex 변경 시 경로 업데이트 (지나온 구간 회색 처리)
  useEffect(() => {
    if (!isNavigationInitialized || !isMapReady) return;

    const intervals = instructionList.current.map(
      instruction => instruction.interval,
    );

    if (intervals.length > 0 && fullPathCoordinateList.current.length > 0) {
      updateNavigationCurrentInterval(currentIntervalIndex.current);
    }
  }, [
    currentIntervalIndex.current,
    isNavigationInitialized,
    isMapReady,
    updateNavigationCurrentInterval,
  ]);

  useTurnController({
    isNavigationMode,
    isNavigationInitialized,
    locationMetaData,
    currentInstruction,
    setCurrentInstruction,
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
      isHandlingOffRouteRef,
      isStationaryRef,
      isBikingStateRef,
      lastOffRouteTimestampRef,
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
    traveledDistanceMeter,
    remainingDistanceMeter,
    setTraveledDistance,
    setRemainingDistance,
    setEta,
    addCaloriesBurned,
    addCarbonSaved,
    refs: {
      pathDataListByInterval,
      instructionList,
      currentIntervalIndex,
      prevTimestampForDistanceRef,
      prevMyPositionForDistanceRef,
      prevTraveledDistanceMeterRef,
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
