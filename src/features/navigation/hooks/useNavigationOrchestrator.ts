import { useUserInfoQuery } from '@/features/auth/services/user.queries';
import { getDistanceBetweenCoords } from '@/features/location/utils/location';
import { useMapStore } from '@/features/map/stores/useMapStore';
import { useNavigationMessenger } from '@/features/navigation/hooks/useNavigationMessenger';
import {
  ACCURACY_OK,
  MOTION_COMMON_OPTIONS,
  TRAVELED_DISTANCE_OPTIONS,
  TURN_CONFIG,
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
  useStartNavigationSessionMutation,
} from '@/features/navigation/services/navigation.queries';
import { useNavigationDetailModalStore } from '@/features/navigation/stores/useNavigationDetailModalStore';
import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore';
import { calculateMotionVector } from '@/features/navigation/utils/calculateMotionVector';
import { classifyTransportBySpeed } from '@/features/navigation/utils/classifyTransportBySpeed';
import {
  calculateEta,
  returnAccurateSpeed,
  calculateRemainingDistance,
  calculateTraveledDistance,
} from '@/features/navigation/utils/navigationController';

import { Coordinate } from '@/features/routing/model/routing.types';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import {
  measureCaloriesBurned,
  measureCarbonSaved,
} from '@/shared/utils/measure';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useShallow } from 'zustand/shallow';

export const useNavigationOrchestrator = () => {
  const { mutateAsync: startNavigationSession } =
    useStartNavigationSessionMutation();

  const { mutateAsync: keepNavigationSessionAlive } =
    useKeepNavigationSessionAliveMutation();

  const { data: userInfoData } = useUserInfoQuery();
  const userGender = userInfoData?.data.gender;

  const { replaceMyLocationMarker } = useNavigationMessenger();

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
  const [traveledDistanceMeter, setTraveledDistance] = useState<
    number | undefined | null
  >(null);
  const currentTtsUrl = useRef<string | null>(null);

  // 턴 진입/지나침 판정용 상태
  const isEnteredRef = useRef<boolean>(false);
  const passCountRef = useRef<number>(0);
  const lastDistanceFromMyPosToNextTurnPosRef = useRef<number | null>(null);
  const prevMyPositionForTurnRef = useRef<Coordinate | null>(null);
  const prevTimestampForTurnRef = useRef<number | null>(null);

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

  // 현재 인터벌 기준 남은 거리, 예상 도착시간 계산, 소요거리용
  const currentIntervalIndex = useRef<number>(0);
  const prevTimestampForDistanceRef = useRef<number | null>(null);
  const prevMyPositionForDistanceRef = useRef<Coordinate | null>(null);
  const prevTraveledDistanceMeterRef = useRef<number>(0);
  const prevRemainingDistanceMeterRef = useRef<number>(
    Number.POSITIVE_INFINITY,
  );

  // 칼로리, 탄소 저감 측정용
  const prevTimestampForMeasureRef = useRef<number | null>(null);
  const prevTraveledDistanceForMeasureRef = useRef<number | null>(null);
  const { STOP_JUDGE_MOVE_METER } = TRAVELED_DISTANCE_OPTIONS;

  // 네비게이션 세션 업데이트용
  const sessionId = useRef<string | null>(null);

  // 네비게이션 디테일 모달 계산용
  const { setTotalIntervals, setCurrentIntervalIndex } =
    useNavigationDetailModalStore(
      useShallow(state => ({
        setTotalIntervals: state.setTotalIntervals,
        setCurrentIntervalIndex: state.setCurrentIntervalIndex,
      })),
    );

  // 초기화
  useEffect(() => {
    if (!isNavigationMode || !routeId) return;
    const initNavigation = async () => {
      // 초기화
      replaceMyLocationMarker();
      pathDataListByInterval.current = [];
      instructionList.current = [];
      fullPathCoordinateList.current = [];
      sessionId.current = null;
      setCurrentInstruction(null);
      nextTurnCoordinate.current = null;
      currentIntervalIndex.current = 0;
      currentTtsUrl.current = null;

      try {
        const payload: StartNavigationSessionPayload = {
          routeId,
        };

        const response: StartNavigationSessionResponse =
          await startNavigationSession(payload);
        sessionId.current = response.data.sessionId;
        fullPathCoordinateList.current = response.data.coordinates;
        instructionList.current = response.data.instructions;
        currentTtsUrl.current =
          response.data.instructions.length > 0
            ? response.data.instructions[0].ttsUrl
            : null;

        if (response.data.instructions.length > 0) {
          setCurrentInstruction(response.data.instructions[0]);
          nextTurnCoordinate.current =
            response.data.instructions[0].nextTurnCoordinate;

          // 네비게이션 디테일 모달 상태 초기화
          setTotalIntervals(response.data.instructions.length);
          setCurrentIntervalIndex(0);
        }

        for (let i = 0; i < response.data.instructions.length; i++) {
          const interval = response.data.instructions[i].interval;
          const segmentCoordinates = response.data.coordinates
            .slice(interval[0], interval[1] + 1)
            .map(coord => ({ lat: coord[1], lng: coord[0] }));
          pathDataListByInterval.current.push({
            intervalIndex: i,
            interval,
            coordinateList: segmentCoordinates,
          });
        }
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
  }, [isNavigationMode, routeId, isMapReady]);

  // 턴 진입/지나침 감지 및 지시 업데이트
  useEffect(() => {
    if (
      !isNavigationMode ||
      !myPosition ||
      !nextTurnCoordinate.current ||
      !currentInstruction
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
    const currentIndex = instructionList.current.findIndex(
      instruction => instruction === currentInstruction,
    );
    const nextIndex = currentIndex + 1;
    if (nextIndex >= instructionList.current.length) return;
    const nextInstruction = instructionList.current[nextIndex];
    setCurrentInstruction(nextInstruction);
    nextTurnCoordinate.current = nextInstruction.nextTurnCoordinate;
    currentIntervalIndex.current = nextIndex;
    currentTtsUrl.current = nextInstruction.ttsUrl;
    resetTurnState();
    prevMyPositionForTurnRef.current = myPosition;
    prevTimestampForTurnRef.current = Date.now();
  }, [myPosition, isNavigationMode, currentInstruction]);

  // prevLocationMetaData와 currentLocationMetaData 구분 저장
  useEffect(() => {
    if (!isNavigationMode || !locationMetaData) return;
    prevLocationMetaData.current = currentLocationMetaData.current;
    currentLocationMetaData.current = locationMetaData;
  }, [locationMetaData, isNavigationMode]);

  // 소요거리/남은거리 업데이트
  useEffect(() => {
    if (
      pathDataListByInterval.current.length === 0 ||
      instructionList.current.length === 0
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

    setTraveledDistance(nextTraveledDistanceMeter);
    setRemainingDistance(nextRemainingDistanceMeter);

    // prevDistance는 각각 갱신 (단조성 기준)
    prevTraveledDistanceMeterRef.current = nextTraveledDistanceMeter;
    prevRemainingDistanceMeterRef.current = nextRemainingDistanceMeter;

    // 공통 prevPos/prevTs 갱신 (속도/정지/점프 판정 기준)
    prevMyPositionForDistanceRef.current = myPosition;
    prevTimestampForDistanceRef.current = currentTimestamp;
  }, [myPosition, locationMetaData, isNavigationMode]);

  // eta 업데이트
  useEffect(() => {
    if (
      prevLocationMetaData.current === null ||
      currentLocationMetaData.current === null
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
  }, [myPosition, locationMetaData, remainingDistanceMeter, isNavigationMode]);

  // 칼로리, 탄소 저감 측정
  useEffect(() => {
    if (!isNavigationMode || traveledDistanceMeter == null || !locationMetaData)
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
  }, [isNavigationMode, traveledDistanceMeter, locationMetaData, userGender]);

  // 세션 유지
  useEffect(() => {
    if (!isNavigationMode || !sessionId.current) return;
    const keepSessionAlive = async () => {
      try {
        const payload: keepNavigationSessionAlivePayload = {
          sessionId: sessionId.current!,
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
  }, [isNavigationMode, sessionId]);

  return {
    pathDataListByInterval: pathDataListByInterval.current,
    currentIntervalIndex: currentIntervalIndex.current,
    currentTtsUrl: currentTtsUrl.current,
    currentInstruction,
    isNavigationMode,
    routeId,
    eta,
    remainingDistanceMeter,
    traveledDistanceMeter,
  };
};
