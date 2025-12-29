import { getDistanceBetweenCoords } from '@/features/location/utils/location';
import { useMapStore } from '@/features/map/stores/useMapStore';
import {
  keepNavigationSessionAlivePayload,
  NavigationInstruction,
  StartNavigationSessionPayload,
  StartNavigationSessionResponse,
} from '@/features/navigation/model/navigation.types';
import {
  useKeepNavigationSessionAliveMutation,
  useStartNavigationSessionMutation,
} from '@/features/navigation/services/navigation.queries';
import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore';
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

  const isMapReady = useMapStore(state => state.isMapReady);

  const { isNavigationMode, routeId } = useNavigationStore(
    useShallow(state => ({
      isNavigationMode: state.isNavigationMode,
      routeId: state.routeId,
    })),
  );
  // 지시 배너 업데이트 기준: 내 위치가 다음 턴 좌표에 가까워지면 다음 지시로 업데이트
  const myPosition = useMyPositionStore(state => state.myPosition);
  const nextTurnCoordinate = useRef<Coordinate | null>(null);

  //  네비게이션 경로 생성 및 실시간 업데이트용
  const fullPathCoordinateList = useRef<[number, number][]>([]);
  const coordinateListByInterval = useRef<Coordinate[]>([]);

  // 지시 및 현재 지시
  const instructionList = useRef<NavigationInstruction[]>([]);
  const [currentInstruction, setCurrentInstruction] =
    useState<NavigationInstruction | null>(null);

  // 네비게이션 세션 업데이트용
  const sessionId = useRef<string | null>(null);

  // 초기화
  useEffect(() => {
    if (!isNavigationMode || !routeId) return;
    const initNavigation = async () => {
      try {
        const payload: StartNavigationSessionPayload = {
          routeId,
        };

        const response: StartNavigationSessionResponse =
          await startNavigationSession(payload);
        sessionId.current = response.data.sessionId;
        fullPathCoordinateList.current = response.data.coordinates;
        instructionList.current = response.data.instructions;

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
          coordinateListByInterval.current.push(...segmentCoordinates);
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

  // 거리 비교 후 지시 비교
  useEffect(() => {
    if (
      !isNavigationMode ||
      !myPosition ||
      !nextTurnCoordinate.current ||
      !currentInstruction
    )
      return;

    const distanceToNextTurn = getDistanceBetweenCoords(
      myPosition,
      nextTurnCoordinate.current,
    );

    // 다음 턴까지 30미터 이내 접근 시 다음 지시로 업데이트
    if (distanceToNextTurn <= 30) {
      // 현재 지시 객체와 같은 객체의 인덱스 참조 (Shallow compare)
      const currentIndex = instructionList.current.findIndex(
        instruction => instruction === currentInstruction,
      );
      const nextIndex = currentIndex + 1;
      if (nextIndex < instructionList.current.length) {
        const nextInstruction = instructionList.current[nextIndex];
        setCurrentInstruction(nextInstruction);
        nextTurnCoordinate.current = nextInstruction.nextTurnCoordinate;
      }
    }
  }, [myPosition]);

  // 세션 유지
  useEffect(() => {
    if (!isNavigationMode && !sessionId.current) return;
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
    currentInstruction,
    isNavigationMode,
    routeId,
  };
};
