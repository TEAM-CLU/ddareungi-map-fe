import { useUserInfoQuery } from '@/features/auth/services/user.queries';
import { getDistanceBetweenCoords } from '@/features/location/utils/location';
import { Coordinates } from '@/features/map/model/map.types';
import { useMapStore } from '@/features/map/stores/useMapStore';
import { useNavigationMessenger } from '@/features/navigation/hooks/useNavigationMessenger';
import {
  TURN_CONFIG,
  MOTION_COMMON_OPTIONS,
  OFF_ROUTE_CONFIG,
  TTS_URL_PRESET,
  TRAVELED_DISTANCE_OPTIONS,
  ACCURACY_OK,
  WAYPOINT_CONFIG,
} from '@/features/navigation/model/navigation.constants';

import {
  IntervalPathData,
  keepNavigationSessionAlivePayload,
  LocationMetaData,
  NavigationInstruction,
  StartNavigationSessionPayload,
  StartNavigationSessionResponse,
} from '@/features/navigation/model/navigation.types';
import {
  useKeepNavigationSessionAliveMutation,
  useReRouteMutation,
  useReturnToExistingRouteMutation,
  useStartNavigationSessionMutation,
} from '@/features/navigation/services/navigation.queries';
import { useNavigationDetailModalStore } from '@/features/navigation/stores/useNavigationDetailModalStore';
import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore';
import { useVolumeStore } from '@/features/navigation/stores/useVolumeStore';
import { calculateMotionVector } from '@/features/navigation/utils/calculateMotionVector';
import { classifyTransportBySpeed } from '@/features/navigation/utils/classifyTransportBySpeed';
import { getMinDistanceInWindow } from '@/features/navigation/utils/getMindistanceInWindow';
import {
  calculateEta,
  returnAccurateSpeed,
  calculateRemainingDistance,
  calculateTraveledDistance,
  findClosestCoordIndex,
} from '@/features/navigation/utils/navigationController';
import { playTts } from '@/features/navigation/libs/playTts';

import { Coordinate, RouteType } from '@/features/routing/model/routing.types';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import {
  measureCaloriesBurned,
  measureCarbonSaved,
} from '@/shared/utils/measure';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { VolumeManager } from 'react-native-volume-manager';
import { useShallow } from 'zustand/react/shallow';

export const useNavigationOrchestrator = () => {
  const { mutateAsync: startNavigationSession } =
    useStartNavigationSessionMutation();

  const { mutateAsync: keepNavigationSessionAlive } =
    useKeepNavigationSessionAliveMutation();

  const { data: userInfoData } = useUserInfoQuery();
  const userGender = userInfoData?.data.gender;

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
  const { myPosition, locationMetaData } = useMyPositionStore(
    useShallow(state => ({
      myPosition: state.myPosition,
      locationMetaData: state.locationMetaData,
    })),
  );
  const nextTurnCoordinate = useRef<Coordinate | null>(null);

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
  const prevMyPositionForTurnRef = useRef<Coordinate | null>(null);
  const prevTimestampForTurnRef = useRef<number | null>(null);
  const previewInstructionText = useRef<string>('');
  const previewTtsUrl = useRef<string | null>(null);
  const previewSign = useRef<number | null>(null);
  const previewEnterCount = useRef<number>(0);

  const {
    ENTRY_RADIUS_METER,
    EXIT_RADIUS_METER,
    DEADZONE_DISTANCE_METER,
    MIN_EFFECTIVE_MOVE_METER,
    DOT_DEADZONE,
    PASS_COUNT_DECAY,
    PASS_COUNT_MAX,
  } = TURN_CONFIG;

  const { MAX_PHYSICAL_SPEED_MPS, PASS_CONFIRM_COUNT } = MOTION_COMMON_OPTIONS;

  // 경로 복귀

  const {
    RECOVERY_TRIGGER_METER,
    REROUTE_TRIGGER_METER,
    MAX_TRIGGER_COUNT,
    COUNT_DECAY,
  } = OFF_ROUTE_CONFIG;

  const recoverTriggerCount = useRef(0);
  const rerouteTriggerCount = useRef(0);
  const isHandlingOffRouteRef = useRef(false);
  const [isLoadingForOffRoute, setIsLoadingForOffRoute] = useState(false);

  const { mutateAsync: recoveryRoute } = useReturnToExistingRouteMutation();
  const { mutateAsync: reroute } = useReRouteMutation();

  const {
    WARNING_OFFROUTE_TTS_URL,
    ARRIVE_WAYPOINT_TTS_URL,
    REROUTE_TTS_URL,
    RECOVER_TTS_URL,
    SUCCESS_REROUTE_TTS_URL,
  } = TTS_URL_PRESET;
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
  const prevMyPositionForDistanceRef = useRef<Coordinate | null>(null);
  const prevTraveledDistanceMeterRef = useRef<number>(0);
  const prevRemainingDistanceMeterRef = useRef<number>(
    Number.POSITIVE_INFINITY,
  );

  // 재탐색 시 소요거리 누적용
  const accumulatedTraveledDistanceRef = useRef<number>(0);

  // 칼로리, 탄소 저감 측정용
  const prevTimestampForMeasureRef = useRef<number | null>(null);
  const prevTraveledDistanceForMeasureRef = useRef<number | null>(null);
  const { STOP_JUDGE_MOVE_METER } = TRAVELED_DISTANCE_OPTIONS;

  // 볼륨 상태
  const { systemVolume, setSystemVolume } = useVolumeStore(
    useShallow(state => ({
      systemVolume: state.systemVolume,
      setSystemVolume: state.setSystemVolume,
    })),
  );

  // 네비게이션 디테일 모달 계산용
  const { setTotalIntervals, setCurrentIntervalIndex } =
    useNavigationDetailModalStore(
      useShallow(state => ({
        setTotalIntervals: state.setTotalIntervals,
        setCurrentIntervalIndex: state.setCurrentIntervalIndex,
      })),
    );

  // 초기화 완료 트리거
  const [isNavigationInitialized, setIsNavigationInitialized] = useState(false);

  const locationTick = useMyPositionStore(
    state => state.locationMetaData?.timestamp,
  );

  // 완전초기화
  const resetAllNavigationState = () => {
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
  };

  // 네비게이션 데이터 적용 함수 (init과 reroute/recovery에서 공통 사용)
  const applyNavigationData = useCallback(
    (navigationData: {
      coordinates: [number, number][];
      instructions: NavigationInstruction[];
      startStation?: {
        lat: number;
        lng: number;
        stationId?: string;
        stationName?: string;
      };
      endStation?: {
        lat: number;
        lng: number;
        stationId?: string;
        stationName?: string;
      };
      waypoints?: [number, number][];
    }) => {
      // coordinates와 instructions 적용
      fullPathCoordinateList.current = navigationData.coordinates;
      instructionList.current = navigationData.instructions;

      // TTS 및 preview 관련 상태 설정
      currentTtsUrl.current =
        navigationData.instructions.length > 0
          ? navigationData.instructions[0].ttsUrl
          : null;
      previewInstructionText.current =
        navigationData.instructions.length > 1
          ? navigationData.instructions[1].text
          : '';
      previewTtsUrl.current =
        navigationData.instructions.length > 1
          ? navigationData.instructions[1].ttsUrl
          : null;
      previewSign.current =
        navigationData.instructions.length > 1
          ? navigationData.instructions[1].sign
          : null;

      // 현재 instruction 및 turn 좌표 설정
      if (navigationData.instructions.length > 0) {
        setCurrentInstruction(navigationData.instructions[0]);
        nextTurnCoordinate.current =
          navigationData.instructions[0].nextTurnCoordinate;

        // 네비게이션 디테일 모달 상태 초기화
        setTotalIntervals(navigationData.instructions.length);
        setCurrentIntervalIndex(0);
      }

      // currentIntervalIndex 리셋
      currentIntervalIndex.current = 0;

      // pathDataListByInterval 재구성
      pathDataListByInterval.current = [];
      for (let i = 0; i < navigationData.instructions.length; i++) {
        const interval = navigationData.instructions[i].interval;
        const segmentCoordinates = navigationData.coordinates
          .slice(interval[0], interval[1] + 1)
          .map(coord => ({ lat: coord[1], lng: coord[0] }));
        pathDataListByInterval.current.push({
          intervalIndex: i,
          interval,
          coordinateList: segmentCoordinates,
        });
      }

      // 턴 관련 상태 리셋
      isEnteredRef.current = false;
      passCountRef.current = 0;
      lastDistanceFromMyPosToNextTurnPosRef.current = null;
      prevMyPositionForTurnRef.current = null;
      prevTimestampForTurnRef.current = null;
      previewEnterCount.current = 0;

      // 네비게이션 경로 그리기
      if (selectedRouteData && isMapReady) {
        // routeType은 useRouteStore의 routeType 사용
        const storeRouteType = useRouteStore.getState().routeType;
        const routeType =
          storeRouteType === 'loop' ? RouteType.LOOP : RouteType.CONSTANT;

        console.log('=== drawNavigationPath 호출 ===');
        console.log('storeRouteType:', storeRouteType);
        console.log('routeType:', routeType);

        // 실제 출발지/도착지 좌표
        const coordinates = navigationData.coordinates;
        const startPoint: [number, number] = coordinates[0];
        const endPoint: [number, number] = coordinates[coordinates.length - 1];

        const intervals = navigationData.instructions.map(
          instruction => instruction.interval,
        );

        console.log('coordinates.length:', coordinates.length);
        console.log('intervals.length:', intervals.length);

        // 대여소 정보: 새로운 정보가 있으면 사용, 없으면 selectedRouteData 사용
        const startStation =
          navigationData.startStation || selectedRouteData.startStation;
        const endStation =
          navigationData.endStation ||
          selectedRouteData.endStation ||
          startStation;

        // 경유지 정보: 새로운 정보가 있으면 사용, 없으면 selectedRouteData 사용
        const waypoints = navigationData.waypoints
          ? navigationData.waypoints.map(wp => ({ lat: wp[1], lng: wp[0] }))
          : selectedRouteData.waypoints || null;

        // loop 모드일 때는 startStationPoint와 endStationPoint를 동일하게 설정
        // (splitPathByStations가 좌표 비교로 loop를 판단하기 때문)
        const startStationPoint = {
          lat: startStation.lat,
          lng: startStation.lng,
        };
        const endStationPoint =
          routeType === RouteType.LOOP
            ? startStationPoint
            : {
                lat: endStation.lat,
                lng: endStation.lng,
              };

        console.log('startStationPoint:', startStationPoint);
        console.log('endStationPoint:', endStationPoint);
        console.log('waypoints:', waypoints);

        drawNavigationPath({
          routeType,
          startPoint,
          endPoint,
          waypoints,
          fullPathCoordinateList: navigationData.coordinates,
          intervals,
          currentIntervalIndex: 0,
          startStationPoint,
          endStationPoint,
        });
      }
    },
    [
      selectedRouteData,
      isMapReady,
      drawNavigationPath,
      setCurrentInstruction,
      setTotalIntervals,
      setCurrentIntervalIndex,
    ],
  );

  // 초기화
  useEffect(() => {
    if (!isNavigationMode || !routeId) return;
    // 초기화
    resetAllNavigationState();

    const initNavigation = async () => {
      try {
        const payload: StartNavigationSessionPayload = {
          routeId,
        };

        const response: StartNavigationSessionResponse =
          await startNavigationSession(payload);
        setSessionId(response.data.sessionId);

        // 공통 데이터 적용 함수 사용
        applyNavigationData({
          coordinates: response.data.coordinates,
          instructions: response.data.instructions,
        });

        setIsNavigationInitialized(true);
        isHandlingOffRouteRef.current = false;
        setIsLoadingForOffRoute(false);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          Alert.alert(
            `${
              error.response?.data?.message ??
              '내비게이션 세션 시작 중 오류가 발생했습니다. 다시 시도해주세요.'
            }`,
          );
        }
      }
    };

    initNavigation();
  }, [isNavigationMode, routeId, isMapReady, applyNavigationData]);

  // currentIntervalIndex 변경 시 경로 업데이트 (지나온 구간 회색 처리)
  useEffect(() => {
    if (!isNavigationInitialized || !isMapReady) return;

    const intervals = instructionList.current.map(
      instruction => instruction.interval,
    );

    if (intervals.length > 0 && fullPathCoordinateList.current.length > 0) {
      updateNavigationCurrentInterval(
        currentIntervalIndex.current,
        intervals,
        fullPathCoordinateList.current,
      );
    }
  }, [
    currentIntervalIndex.current,
    isNavigationInitialized,
    isMapReady,
    updateNavigationCurrentInterval,
  ]);

  // 턴 진입/지나침 감지 및 지시 업데이트
  useEffect(() => {
    if (
      !isNavigationMode ||
      !myPosition ||
      !nextTurnCoordinate.current ||
      !currentInstruction ||
      !isNavigationInitialized
    ) {
      return;
    }

    const resetTurnState = () => {
      isEnteredRef.current = false;
      passCountRef.current = 0;
      lastDistanceFromMyPosToNextTurnPosRef.current = null;
    };

    // 1) 정확도 체크
    const currentAccuracy = currentLocationMetaData.current?.accuracy;
    if (typeof currentAccuracy === 'number' && currentAccuracy > ACCURACY_OK) {
      return;
    }

    // 2) 턴까지 거리
    const distanceToNextTurn = getDistanceBetweenCoords(
      myPosition,
      nextTurnCoordinate.current,
    );

    const nowTimestamp = Date.now();

    // =========================
    // 3) entry / exit
    // =========================
    if (!isEnteredRef.current && distanceToNextTurn <= ENTRY_RADIUS_METER) {
      isEnteredRef.current = true;
      passCountRef.current = 0;
      lastDistanceFromMyPosToNextTurnPosRef.current = distanceToNextTurn;
      prevMyPositionForTurnRef.current = myPosition;
      prevTimestampForTurnRef.current = nowTimestamp;
      previewEnterCount.current += 1;

      return;
    }

    if (isEnteredRef.current && distanceToNextTurn >= EXIT_RADIUS_METER) {
      resetTurnState();

      prevMyPositionForTurnRef.current = myPosition;
      prevTimestampForTurnRef.current = nowTimestamp;
      return;
    }

    // entry 아니면 passed 판정 자체 안 함
    if (!isEnteredRef.current) {
      prevMyPositionForTurnRef.current = myPosition;
      prevTimestampForTurnRef.current = nowTimestamp;
      lastDistanceFromMyPosToNextTurnPosRef.current = distanceToNextTurn;
      return;
    }

    // =========================
    // 4) 거리 증가 추세 (멀어지기 시작, isEntering 이후부터 측정)
    // =========================
    const prevDistance = lastDistanceFromMyPosToNextTurnPosRef.current;
    lastDistanceFromMyPosToNextTurnPosRef.current = distanceToNextTurn;

    if (prevDistance == null) {
      prevMyPositionForTurnRef.current = myPosition;
      prevTimestampForTurnRef.current = nowTimestamp;
      return;
    }

    const deltaDistance = distanceToNextTurn - prevDistance;
    const isGettingFarther = deltaDistance > DEADZONE_DISTANCE_METER;

    // =========================
    // 5) 벡터/내적 + 속도 게이트
    // =========================
    const prevPosition = prevMyPositionForTurnRef.current;
    const prevTimestamp = prevTimestampForTurnRef.current;

    // prev 갱신은 여기서 한번만
    prevMyPositionForTurnRef.current = myPosition;
    prevTimestampForTurnRef.current = nowTimestamp;

    if (!prevPosition || prevTimestamp == null) return;

    const dtSec = (nowTimestamp - prevTimestamp) / 1000;
    const { moveMag, speedMps, dot } = calculateMotionVector(
      prevPosition,
      myPosition,
      nextTurnCoordinate.current,
      dtSec,
    );

    // GPS 점프 컷오프
    if (speedMps > MAX_PHYSICAL_SPEED_MPS) {
      passCountRef.current = Math.max(
        0,
        passCountRef.current - PASS_COUNT_DECAY,
      );
      return;
    }

    // 이동이 너무 작으면 방향 판정 의미 없음
    if (moveMag < MIN_EFFECTIVE_MOVE_METER) {
      passCountRef.current = Math.max(
        0,
        passCountRef.current - PASS_COUNT_DECAY,
      );
      return;
    }

    // dot < 0 => 턴포인트를 등지고 움직임(멀어지는 방향)
    const isMovingAwayFromTurn = dot < DOT_DEADZONE;

    // =========================
    // 6) passed 카운트
    // =========================
    const isPassedCandidate = isGettingFarther && isMovingAwayFromTurn;

    if (!isPassedCandidate) {
      passCountRef.current = Math.max(
        0,
        passCountRef.current - PASS_COUNT_DECAY,
      );
      return;
    }
    passCountRef.current = Math.min(PASS_COUNT_MAX, passCountRef.current + 1);

    // =========================
    // 7) 통과 확정 → 다음 instruction
    // =========================
    if (passCountRef.current < PASS_CONFIRM_COUNT) return;

    const nextIndex = currentIntervalIndex.current + 1;
    if (nextIndex >= instructionList.current.length) return;
    const nextInstruction = instructionList.current[nextIndex];
    setCurrentInstruction(nextInstruction);
    nextTurnCoordinate.current = nextInstruction.nextTurnCoordinate;
    currentIntervalIndex.current = nextIndex;
    currentTtsUrl.current = nextInstruction.ttsUrl;
    previewInstructionText.current =
      instructionList.current[nextIndex + 1]?.text ?? '';
    previewTtsUrl.current =
      instructionList.current[nextIndex + 1]?.ttsUrl ?? null;
    previewSign.current = instructionList.current[nextIndex + 1]?.sign ?? null;
    previewEnterCount.current = 0;
    resetTurnState();
    prevMyPositionForTurnRef.current = myPosition;
    prevTimestampForTurnRef.current = Date.now();
  }, [
    myPosition,
    isNavigationMode,
    currentInstruction,
    isNavigationInitialized,
  ]);

  // prevLocationMetaData와 currentLocationMetaData 구분 저장
  useEffect(() => {
    if (!isNavigationMode || !locationMetaData || !isNavigationInitialized)
      return;
    prevLocationMetaData.current = currentLocationMetaData.current;
    currentLocationMetaData.current = locationMetaData;
  }, [locationTick, isNavigationMode, isNavigationInitialized]);

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

    const waypoints: Coordinate[] = selectedRouteData.waypoints ?? [];
    if (waypoints.length === 0) return;

    // 이미 다 지나쳤으면 끝
    if (passedWaypointIdxSetRef.current.size >= waypoints.length) return;

    // 아직 안 지나친 waypoint 중 "가장 가까운 것" 찾기
    let bestIdx = -1;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < waypoints.length; i++) {
      if (passedWaypointIdxSetRef.current.has(i)) continue;

      const d = getDistanceBetweenCoords(myPosition, waypoints[i]);
      if (d < bestDistance) {
        bestDistance = d;
        bestIdx = i;
      }
    }

    if (bestIdx < 0) return;

    const ENTRY_METER = WAYPOINT_CONFIG.ENTRY_RADIUS_METER;
    const EXIT_METER = WAYPOINT_CONFIG.EXIT_RADIUS_METER;
    const PASS_CONFIRM = WAYPOINT_CONFIG.PASS_CONFIRM_COUNT;

    // 1) entry: 반경 안으로 들어오면 "이번 후보 waypoint"를 고정
    if (!isWaypointEnteredRef.current && bestDistance <= ENTRY_METER) {
      isWaypointEnteredRef.current = true;
      waypointCandidateIdxRef.current = bestIdx;
      waypointPassCountRef.current = 0;
      return;
    }

    // entry 상태가 아니면 종료
    if (!isWaypointEnteredRef.current) return;

    const candidateIdx = waypointCandidateIdxRef.current;
    if (candidateIdx < 0) {
      isWaypointEnteredRef.current = false;
      return;
    }

    // 후보 waypoint 기준 거리로 다시 측정 (bestIdx가 바뀌면 흔들리니까 "후보 고정"이 중요)
    const candidateDist = getDistanceBetweenCoords(
      myPosition,
      waypoints[candidateIdx],
    );

    // 2) exit: 후보에서 멀어졌으면 "지나침 후보" 카운트
    if (candidateDist >= EXIT_METER) {
      waypointPassCountRef.current += 1;

      if (waypointPassCountRef.current < PASS_CONFIRM) return;

      // 지나침 확정
      passedWaypointIdxSetRef.current.add(candidateIdx);

      // 원하는 결과값: 지나친 모든 waypoint index
      const nextArr = Array.from(passedWaypointIdxSetRef.current).sort(
        (a, b) => a - b,
      );
      setPassedWaypointIndexes(nextArr);

      playTts('tts-waypoint-arrive', ARRIVE_WAYPOINT_TTS_URL, systemVolume);

      // 상태 리셋
      isWaypointEnteredRef.current = false;
      waypointCandidateIdxRef.current = -1;
      waypointPassCountRef.current = 0;
      return;
    }

    // 3) 아직 exit 아니면 passCount는 감쇠/리셋 (튐 방지)
    waypointPassCountRef.current = 0;
  }, [
    isNavigationMode,
    locationTick,
    selectedRouteData,
    isNavigationInitialized,
  ]);
  const lastOffRouteTimestampRef = useRef<number | null>(null);
  const offRouteTickBusyRef = useRef(false);

  // 경로복귀
  useEffect(() => {
    if (
      !isNavigationMode ||
      !currentLocationMetaData.current ||
      !sessionId ||
      !isNavigationInitialized
    )
      return;
    const locationMetaData = currentLocationMetaData.current;

    const timestamp =
      typeof locationMetaData.timestamp === 'number'
        ? locationMetaData.timestamp
        : null;

    if (timestamp !== null) {
      if (lastOffRouteTimestampRef.current === timestamp) return;
      lastOffRouteTimestampRef.current = timestamp;
    }

    const myPosition = currentLocationMetaData.current.coordinate;
    const positionAccuracy = currentLocationMetaData.current?.accuracy;
    if (typeof positionAccuracy !== 'number') return;
    if (positionAccuracy > ACCURACY_OK) return;

    if (offRouteTickBusyRef.current) return;
    offRouteTickBusyRef.current = true;

    const judgeOffRoute = async () => {
      const intervalCoordinateList =
        pathDataListByInterval.current[currentIntervalIndex.current]
          ?.coordinateList ?? [];

      if (intervalCoordinateList.length < 2) return;

      const bestIdx = findClosestCoordIndex(myPosition, intervalCoordinateList);
      if (bestIdx < 0) return;

      const minDistanceFromMyPosToPath = getMinDistanceInWindow(
        myPosition,
        intervalCoordinateList,
        bestIdx,
      );

      // off-route 기준은 "멀어짐"
      const isOffForRecovery =
        minDistanceFromMyPosToPath >= RECOVERY_TRIGGER_METER;
      const isOffForReroute =
        minDistanceFromMyPosToPath >= REROUTE_TRIGGER_METER;

      // 카운트 업데이트 + 정상 복귀 시 리셋
      const routeType =
        useRouteStore.getState().routeType === 'loop'
          ? RouteType.LOOP
          : RouteType.CONSTANT;

      // 카운트 업데이트 + 정상 복귀 시 리셋
      if (routeType === RouteType.LOOP) {
        // loop는 거리 상관없이 무조건 recover 카운트만 증가
        if (isOffForRecovery || isOffForReroute) {
          recoverTriggerCount.current = Math.min(
            MAX_TRIGGER_COUNT,
            recoverTriggerCount.current + 1,
          );
          rerouteTriggerCount.current = Math.max(
            0,
            rerouteTriggerCount.current - COUNT_DECAY,
          );

          if (
            !isHandlingOffRouteRef.current &&
            recoverTriggerCount.current === 1
          ) {
            playTts(
              'tts-offroute-warning',
              WARNING_OFFROUTE_TTS_URL,
              systemVolume,
            );
          }
        } else {
          // 정상 복귀
          recoverTriggerCount.current = Math.max(
            0,
            recoverTriggerCount.current - COUNT_DECAY,
          );
          rerouteTriggerCount.current = Math.max(
            0,
            rerouteTriggerCount.current - COUNT_DECAY,
          );
        }
      } else {
        // CONSTANT: 기존 로직 (거리에 따라 reroute vs recover 구분)
        if (isOffForReroute) {
          rerouteTriggerCount.current = Math.min(
            MAX_TRIGGER_COUNT,
            rerouteTriggerCount.current + 1,
          );
          recoverTriggerCount.current = Math.max(
            0,
            recoverTriggerCount.current - COUNT_DECAY,
          );

          if (
            !isHandlingOffRouteRef.current &&
            rerouteTriggerCount.current === 1
          ) {
            playTts(
              'tts-offroute-warning',
              WARNING_OFFROUTE_TTS_URL,
              systemVolume,
            );
          }
        } else if (isOffForRecovery) {
          recoverTriggerCount.current = Math.min(
            MAX_TRIGGER_COUNT,
            recoverTriggerCount.current + 1,
          );
          rerouteTriggerCount.current = Math.max(
            0,
            rerouteTriggerCount.current - COUNT_DECAY,
          );

          if (
            !isHandlingOffRouteRef.current &&
            recoverTriggerCount.current === 1
          ) {
            playTts(
              'tts-offroute-warning',
              WARNING_OFFROUTE_TTS_URL,
              systemVolume,
            );
          }
        } else {
          // 정상 복귀
          recoverTriggerCount.current = Math.max(
            0,
            recoverTriggerCount.current - COUNT_DECAY,
          );
          rerouteTriggerCount.current = Math.max(
            0,
            rerouteTriggerCount.current - COUNT_DECAY,
          );
        }
      }

      // 경유지 정보 준비
      const remainingWaypoints = selectedRouteData?.waypoints
        ?.map((wp, idx) =>
          passedWaypointIdxSetRef.current.has(idx)
            ? null
            : { lat: wp.lat, lng: wp.lng },
        )
        .filter((wp): wp is Coordinates => wp !== null);

      // 우선순위: reroute > recovery(원형탐색은 reroute 안 함)
      if (
        rerouteTriggerCount.current >= MAX_TRIGGER_COUNT &&
        routeType === RouteType.CONSTANT
      ) {
        if (isHandlingOffRouteRef.current) return;
        isHandlingOffRouteRef.current = true;
        setIsLoadingForOffRoute(true);
        rerouteTriggerCount.current = 0;
        recoverTriggerCount.current = 0;

        // 재탐색 직전 현재 소요거리를 누적값에 저장
        if (
          traveledDistanceMeter !== null &&
          traveledDistanceMeter !== undefined
        ) {
          accumulatedTraveledDistanceRef.current = traveledDistanceMeter;
        }

        try {
          // 재탐색 API 호출
          const response = await reroute({
            sessionId,
            currentLocation: {
              lat: myPosition.lat,
              lng: myPosition.lng,
            },
            remainingWaypoints: remainingWaypoints?.length
              ? remainingWaypoints
              : [],
          });

          // 응답 데이터 추출 (API가 response.data.data를 반환하므로 response 자체가 데이터)
          const coordinates = response.data.coordinates;
          const instructions = response.data.instructions;

          // 응답 데이터 검증
          if (
            !coordinates ||
            !instructions ||
            coordinates.length === 0 ||
            instructions.length === 0
          ) {
            console.error('Invalid reroute response:', response);
            Alert.alert('재탐색 실패', '경로 데이터를 받아오지 못했습니다.');
            return;
          }

          // 응답 데이터를 바로 적용 (공통 함수 사용) - 새로운 대여소/경유지 정보 포함
          applyNavigationData({
            coordinates,
            instructions,
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
                  wp => [wp.lng, wp.lat] as [number, number],
                )
              : undefined,
          });

          // 상태 초기화
          setIsNavigationInitialized(true);

          playTts('tts-offroute-reroute', REROUTE_TTS_URL, systemVolume);
          playTts(
            'tts-offroute-reroute-success',
            SUCCESS_REROUTE_TTS_URL,
            systemVolume,
          );
        } catch (error) {
          console.error('Reroute error:', error);
        } finally {
          isHandlingOffRouteRef.current = false;
          setIsLoadingForOffRoute(false);
        }
        return;
      }

      if (recoverTriggerCount.current >= MAX_TRIGGER_COUNT) {
        if (isHandlingOffRouteRef.current) return;
        isHandlingOffRouteRef.current = true;
        setIsLoadingForOffRoute(true);
        rerouteTriggerCount.current = 0;
        recoverTriggerCount.current = 0;

        // 경로 복귀 직전 현재 소요거리를 누적값에 저장
        if (traveledDistanceMeter != null) {
          accumulatedTraveledDistanceRef.current = traveledDistanceMeter;
        }

        try {
          // 경로 복귀 API 호출
          const response = await recoveryRoute({
            sessionId,
            currentLocation: {
              lat: myPosition.lat,
              lng: myPosition.lng,
            },
            remainingWaypoints: remainingWaypoints?.length
              ? remainingWaypoints
              : [],
          });

          // 응답 데이터 추출 (API가 response.data.data를 반환하므로 response 자체가 데이터)
          const coordinates = response.data.coordinates;
          const instructions = response.data.instructions;

          // 응답 데이터 검증
          if (
            !coordinates ||
            !instructions ||
            coordinates.length === 0 ||
            instructions.length === 0
          ) {
            console.error('Invalid recovery response:', response);
            Alert.alert('경로 복귀 실패', '경로 데이터를 받아오지 못했습니다.');
            return;
          }

          // 응답 데이터를 바로 적용 (공통 함수 사용) - 새로운 대여소/경유지 정보 포함
          applyNavigationData({
            coordinates,
            instructions,
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
                  wp => [wp.lng, wp.lat] as [number, number],
                )
              : undefined,
          });

          // 상태 초기화
          setIsNavigationInitialized(true);

          playTts('tts-offroute-recover', RECOVER_TTS_URL, systemVolume);
          playTts(
            'tts-offroute-reroute-success',
            SUCCESS_REROUTE_TTS_URL,
            systemVolume,
          );
        } catch (error) {
          console.error('Recovery error:', error);
        } finally {
          isHandlingOffRouteRef.current = false;
          setIsLoadingForOffRoute(false);
        }
      }
    };

    (async () => {
      try {
        await judgeOffRoute();
      } finally {
        offRouteTickBusyRef.current = false;
      }
    })();
  }, [isNavigationMode, locationTick, sessionId, isNavigationInitialized]);

  // 소요거리/남은거리 업데이트
  useEffect(() => {
    if (
      pathDataListByInterval.current.length === 0 ||
      instructionList.current.length === 0 ||
      !isNavigationInitialized
    )
      return;

    if (!isNavigationMode || !myPosition || !locationMetaData) return;

    const currentTimestamp =
      typeof locationMetaData.timestamp === 'number'
        ? locationMetaData.timestamp
        : Date.now();

    const prevMyPositionForDistance = prevMyPositionForDistanceRef.current;
    const prevTimestampForDistance = prevTimestampForDistanceRef.current;

    // 첫 샘플(초기값) 처리: prevPos/prevTs가 없으면 "prev 세팅"부터 하고 종료
    if (
      prevMyPositionForDistance === null ||
      prevTimestampForDistance === null
    ) {
      // traveled (첫 값은 증가/감소 안정화보단 "기준값 세팅" 의미)
      const firstTraveledDistanceMeter = calculateTraveledDistance(
        myPosition,
        pathDataListByInterval.current,
        currentIntervalIndex.current,
        instructionList.current,

        prevTraveledDistanceMeterRef.current, //  0
        null,
        null,
        currentTimestamp,
      );

      // remaining (첫 값도 기준값 세팅)
      const firstRemainingDistanceMeter = calculateRemainingDistance(
        myPosition,
        pathDataListByInterval.current,
        currentIntervalIndex.current,
        instructionList.current,

        prevRemainingDistanceMeterRef.current, //  0
        null,
        null,
        currentTimestamp,
      );

      setTraveledDistance(firstTraveledDistanceMeter);
      setRemainingDistance(firstRemainingDistanceMeter);

      // 다음 tick부터 stabilize가 제대로 먹도록 prev 갱신
      prevTraveledDistanceMeterRef.current = firstTraveledDistanceMeter;
      prevRemainingDistanceMeterRef.current = firstRemainingDistanceMeter;

      prevMyPositionForDistanceRef.current = myPosition;
      prevTimestampForDistanceRef.current = currentTimestamp;
      return;
    }

    // traveled 계산 (내부에서 stabilizeDistance까지 끝남)
    const nextTraveledDistanceMeter = calculateTraveledDistance(
      myPosition,
      pathDataListByInterval.current,
      currentIntervalIndex.current,
      instructionList.current,

      prevTraveledDistanceMeterRef.current,
      prevMyPositionForDistance,
      prevTimestampForDistance,
      currentTimestamp,
    );

    // 누적 소요거리 더하기 (재탐색 시 이전 거리 유지)
    const finalTraveledDistanceMeter =
      nextTraveledDistanceMeter + accumulatedTraveledDistanceRef.current;

    // remaining 계산 (내부에서 stabilizeDistance까지 끝남)
    const nextRemainingDistanceMeter = calculateRemainingDistance(
      myPosition,
      pathDataListByInterval.current,
      currentIntervalIndex.current,
      instructionList.current,

      prevRemainingDistanceMeterRef.current,
      prevMyPositionForDistance,
      prevTimestampForDistance,
      currentTimestamp,
    );

    setTraveledDistance(finalTraveledDistanceMeter);
    setRemainingDistance(nextRemainingDistanceMeter);

    // prevDistance는 각각 갱신 (단조성 기준)
    prevTraveledDistanceMeterRef.current = finalTraveledDistanceMeter;
    prevRemainingDistanceMeterRef.current = nextRemainingDistanceMeter;

    // 공통 prevPos/prevTs 갱신 (속도/정지/점프 판정 기준)
    prevMyPositionForDistanceRef.current = myPosition;
    prevTimestampForDistanceRef.current = currentTimestamp;
  }, [myPosition, locationTick, isNavigationMode, isNavigationInitialized]);

  // eta 업데이트
  useEffect(() => {
    if (
      prevLocationMetaData.current === null ||
      currentLocationMetaData.current === null ||
      !isNavigationInitialized
    )
      return;

    if (!remainingDistanceMeter) return;
    if (!isNavigationMode || !myPosition || !locationMetaData) return;

    // eta 계산
    // 1) 정확하고 보정된 속도 사용
    const accurateSpeedMps = returnAccurateSpeed(
      prevLocationMetaData.current,
      currentLocationMetaData.current,
    );
    prevEmaSpeedMps.current = accurateSpeedMps;

    // 2) 남은 거리 / 속도 = 남은 시간
    setEta(calculateEta(remainingDistanceMeter, accurateSpeedMps));
  }, [
    myPosition,
    locationTick,
    remainingDistanceMeter,
    isNavigationMode,
    isNavigationInitialized,
  ]);

  // 칼로리, 탄소 저감 측정
  useEffect(() => {
    if (
      !isNavigationMode ||
      traveledDistanceMeter == null ||
      !locationMetaData ||
      !isNavigationInitialized
    )
      return;

    // 첫 샘플 세팅
    if (prevTraveledDistanceForMeasureRef.current === null) {
      prevTraveledDistanceForMeasureRef.current = traveledDistanceMeter;
      return;
    }

    const prevTraveledDistanceForMeasure =
      prevTraveledDistanceForMeasureRef.current;
    const deltaDistance =
      traveledDistanceMeter - prevTraveledDistanceForMeasure;

    // 다음 tick 준비
    prevTraveledDistanceForMeasureRef.current = traveledDistanceMeter;
    const safeDeltaDistance = Math.max(0, deltaDistance);

    if (safeDeltaDistance <= STOP_JUDGE_MOVE_METER) return;

    // 시간 delta는 timestamp로
    const currentTimestamp =
      typeof locationMetaData.timestamp === 'number'
        ? locationMetaData.timestamp
        : Date.now();

    const prevTimestampForMeasure = prevTimestampForMeasureRef.current;
    if (prevTimestampForMeasure == null) {
      prevTimestampForMeasureRef.current = currentTimestamp;
      return;
    }

    const dtSec = Math.max(
      0.001,
      (currentTimestamp - prevTimestampForMeasure) / 1000,
    );
    prevTimestampForMeasureRef.current = currentTimestamp;

    const currentSpeedMps = safeDeltaDistance / dtSec;

    // 말도 안 되는 speed는 컷
    if (currentSpeedMps > MOTION_COMMON_OPTIONS.MAX_PHYSICAL_SPEED_MPS) return;

    const transportationType = classifyTransportBySpeed(currentSpeedMps);

    const currentCaloriesDelta = measureCaloriesBurned(
      transportationType,
      userGender,
      dtSec,
    );

    const currentCarbonDelta = measureCarbonSaved(
      transportationType,
      safeDeltaDistance,
    );

    addCaloriesBurned(currentCaloriesDelta);
    addCarbonSaved(currentCarbonDelta);
  }, [
    isNavigationMode,
    traveledDistanceMeter,
    locationTick,
    userGender,
    isNavigationInitialized,
  ]);

  // 시스템 볼륨 초기값 설정 및 리스너 등록
  useEffect(() => {
    const canUseVolumeManager =
      VolumeManager &&
      typeof VolumeManager.getVolume === 'function' &&
      typeof VolumeManager.addVolumeListener === 'function';

    if (!canUseVolumeManager) {
      return;
    }

    try {
      VolumeManager.getVolume().then(volumeData =>
        setSystemVolume(volumeData.volume),
      );
    } catch (error) {
      console.error('시스템 볼륨을 가져오는 중 오류 발생:', error);
    }

    const volumeListener = VolumeManager.addVolumeListener(
      (volumeData: { volume: number }) => {
        setSystemVolume(volumeData.volume);
      },
    );

    return () => {
      volumeListener.remove();
    };
  }, []);

  // 세션 유지
  useEffect(() => {
    if (!isNavigationMode || !sessionId || !isNavigationInitialized) return;
    const keepSessionAlive = async () => {
      try {
        const payload: keepNavigationSessionAlivePayload = {
          sessionId: sessionId,
        };

        await keepNavigationSessionAlive(payload);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          Alert.alert(
            `${
              error.response?.data?.message ??
              '내비게이션 세션 유지 중 오류가 발생했습니다. 다시 시도해주세요.'
            }`,
          );
        }
      }
    };

    const intervalId = setInterval(() => {
      keepSessionAlive();
    }, 9 * 60 * 1000); // 9분마다 세션 유지 요청

    return () => {
      clearInterval(intervalId);
    };
  }, [isNavigationMode, sessionId, isNavigationInitialized]);

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
