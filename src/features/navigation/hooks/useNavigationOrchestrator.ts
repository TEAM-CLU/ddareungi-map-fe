import { getDistanceBetweenCoords } from '@/features/location/utils/location';
import { useMapStore } from '@/features/map/stores/useMapStore';
import { useNavigationMessenger } from '@/features/navigation/hooks/useNavigationMessenger';
import {
  ACCURACY_OK,
  DEADZONE_DISTANCE_METER,
  DOT_DEADZONE,
  ENTRY_RADIUS_METER,
  EXIT_RADIUS_METER,
  MAX_SPEED_MPS,
  MIN_MOVE_METER,
  PASS_CONFIRM_COUNT,
  PASS_COUNT_DECAY,
  PASS_COUNT_MAX,
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
import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore';
import { calculateMotionVector } from '@/features/navigation/utils/calculateMotionVector';
import {
  calculateRemainingDistanceMeter,
  calculateTraveledDistanceMeter,
  calculateEta,
  returnAccurateSpeedMeterPerSec,
} from '@/features/navigation/utils/navigationController';

import { Coordinate } from '@/features/routing/model/routing.types';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useShallow } from 'zustand/shallow';

export const useNavigationOrchestrator = () => {
  const { mutateAsync: startNavigationSession } =
    useStartNavigationSessionMutation();

  const { mutateAsync: keepNavigationSessionAlive } =
    useKeepNavigationSessionAliveMutation();

  const { replaceMyLocationMarker } = useNavigationMessenger();

  const isMapReady = useMapStore(state => state.isMapReady);

  const { isNavigationMode, routeId } = useNavigationStore(
    useShallow(state => ({
      isNavigationMode: state.isNavigationMode,
      routeId: state.routeId,
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
  const prevEmaSpeedMeterPerSec = useRef<number | null>(null);
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
  const prevMyPositionRef = useRef<Coordinate | null>(null);
  const prevTimestampRef = useRef<number | null>(null);

  // 현재 인터벌 기준 남은 거리, 예상 도착시간 계산용
  const currentIntervalIndex = useRef<number>(0);

  // 네비게이션 세션 업데이트용
  const sessionId = useRef<string | null>(null);

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

      prevMyPositionRef.current = myPosition;
      prevTimestampRef.current = nowTimestamp;
      return;
    }

    if (isEnteredRef.current && distanceToNextTurn >= EXIT_RADIUS_METER) {
      resetTurnState();

      prevMyPositionRef.current = myPosition;
      prevTimestampRef.current = nowTimestamp;
      return;
    }

    // entry 아니면 passed 판정 자체 안 함
    if (!isEnteredRef.current) {
      prevMyPositionRef.current = myPosition;
      prevTimestampRef.current = nowTimestamp;
      lastDistanceFromMyPosToNextTurnPosRef.current = distanceToNextTurn;
      return;
    }

    // =========================
    // 4) 거리 증가 추세 (멀어지기 시작, isEntering 이후부터 측정)
    // =========================
    const prevDistance = lastDistanceFromMyPosToNextTurnPosRef.current;
    lastDistanceFromMyPosToNextTurnPosRef.current = distanceToNextTurn;

    if (prevDistance == null) {
      prevMyPositionRef.current = myPosition;
      prevTimestampRef.current = nowTimestamp;
      return;
    }

    const deltaDistance = distanceToNextTurn - prevDistance;
    const isGettingFarther = deltaDistance > DEADZONE_DISTANCE_METER;

    // =========================
    // 5) 벡터/내적 + 속도 게이트
    // =========================
    const prevPosition = prevMyPositionRef.current;
    const prevTimestamp = prevTimestampRef.current;

    // prev 갱신은 여기서 한번만
    prevMyPositionRef.current = myPosition;
    prevTimestampRef.current = nowTimestamp;

    if (!prevPosition || prevTimestamp == null) return;

    const dtSec = (nowTimestamp - prevTimestamp) / 1000;
    const { moveMag, speedMps, dot } = calculateMotionVector(
      prevPosition,
      myPosition,
      nextTurnCoordinate.current,
      dtSec,
    );

    // GPS 점프 컷
    if (speedMps > MAX_SPEED_MPS) {
      passCountRef.current = Math.max(
        0,
        passCountRef.current - PASS_COUNT_DECAY,
      );
      return;
    }

    // 이동이 너무 작으면 방향 판정 의미 없음
    if (moveMag < MIN_MOVE_METER) {
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
    if (passCountRef.current >= PASS_CONFIRM_COUNT) {
      const currentIndex = instructionList.current.findIndex(
        instruction => instruction === currentInstruction,
      );
      const nextIndex = currentIndex + 1;
      if (nextIndex < instructionList.current.length) {
        const nextInstruction = instructionList.current[nextIndex];
        setCurrentInstruction(nextInstruction);
        nextTurnCoordinate.current = nextInstruction.nextTurnCoordinate;
        currentIntervalIndex.current = nextIndex;
        currentTtsUrl.current = nextInstruction.ttsUrl;
        resetTurnState();
        prevMyPositionRef.current = myPosition;
        prevTimestampRef.current = Date.now();
      }
    }
  }, [myPosition, isNavigationMode, currentInstruction]);

  // prevLocationMetaData와 currentLocationMetaData 구분 저장
  useEffect(() => {
    if (!isNavigationMode || !locationMetaData) return;
    prevLocationMetaData.current = currentLocationMetaData.current;
    currentLocationMetaData.current = locationMetaData;
  }, [locationMetaData, isNavigationMode]);

  // 남은거리, 이동거리 업데이트
  useEffect(() => {
    if (
      pathDataListByInterval.current.length === 0 ||
      instructionList.current.length === 0
    )
      return;

    if (!isNavigationMode || !myPosition || !locationMetaData) return;

    // 남은 거리 계산
    setRemainingDistance(
      calculateRemainingDistanceMeter(
        myPosition,
        pathDataListByInterval.current,
        currentIntervalIndex.current,
        instructionList.current,
      ),
    );
    // 소요 거리 계산
    setTraveledDistance(
      calculateTraveledDistanceMeter(
        myPosition,
        pathDataListByInterval.current,
        currentIntervalIndex.current,
        instructionList.current,
      ),
    );
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
    const accurateSpeedMeterPerSec = returnAccurateSpeedMeterPerSec(
      prevLocationMetaData.current,
      currentLocationMetaData.current,
    );
    prevEmaSpeedMeterPerSec.current = accurateSpeedMeterPerSec;

    // 2) 남은 거리 / 속도 = 남은 시간
    setEta(calculateEta(remainingDistanceMeter, accurateSpeedMeterPerSec));

    console.log(
      '디버깅 ETA 업데이트:',
      remainingDistanceMeter,
      accurateSpeedMeterPerSec,
      eta,
      myPosition,
      locationMetaData,
    );
  }, [myPosition, locationMetaData, remainingDistanceMeter, isNavigationMode]);

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
    }, 10 * 60 * 1000); // 10분마다 세션 유지 요청

    return () => {
      clearInterval(intervalId);
    };
  }, [isNavigationMode, sessionId]);

  return {
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
