import { useCallback, type RefObject } from 'react';
import { Coordinates } from '@/features/map/model/map.types';
import { NavigationWalkingPolicy } from '@/shared/model/map.webview.types';
import { Route, RouteType } from '@/features/routing/model/routing.types';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import {
  IntervalPathData,
  NavigationInstruction,
} from '@/features/navigation/model/navigation.types';

export type ApplyNavigationDataInput = {
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
};

export type UseNavigationDataApplyParams = {
  selectedRouteData: Route | null;
  isMapReady: boolean;
  drawNavigationPath: (payload: {
    routeType: RouteType;
    startPoint: [number, number];
    endPoint: [number, number];
    waypoints: Coordinates[] | null;
    fullPathCoordinateList: [number, number][];
    intervals: [number, number][];
    currentIntervalIndex: number;
    startStationPoint: { lat: number; lng: number };
    endStationPoint: { lat: number; lng: number };
    walkingPolicy: NavigationWalkingPolicy;
  }) => void;
  setCurrentInstruction: (inst: NavigationInstruction | null) => void;
  setInstructionList: (list: NavigationInstruction[]) => void;
  setCurrentIntervalIndex: (idx: number) => void;
  refs: {
    fullPathCoordinateList: RefObject<[number, number][]>;
    pathDataListByInterval: RefObject<IntervalPathData[]>;
    instructionList: RefObject<NavigationInstruction[]>;
    nextTurnCoordinate: RefObject<Coordinates | null>;
    currentIntervalIndex: RefObject<number>;
    currentTtsUrl: RefObject<string | null>;
    previewInstructionText: RefObject<string>;
    previewTtsUrl: RefObject<string | null>;
    previewSign: RefObject<number | null>;
    isEnteredRef: RefObject<boolean>;
    passCountRef: RefObject<number>;
    lastDistanceFromMyPosToNextTurnPosRef: RefObject<number | null>;
    prevMyPositionForTurnRef: RefObject<Coordinates | null>;
    prevTimestampForTurnRef: RefObject<number | null>;
    previewEnterCount: RefObject<number>;
    // metrics reset on re-route
    prevTimestampForDistanceRef?: RefObject<number | null>;
    prevMyPositionForDistanceRef?: RefObject<Coordinates | null>;
    prevTraveledDistanceMeterRef?: RefObject<number>;
    prevRemainingDistanceMeterRef?: RefObject<number>;
    prevTimestampForMeasureRef?: RefObject<number | null>;
    prevTraveledDistanceForMeasureRef?: RefObject<number | null>;
  };
};

export const useNavigationDataApply = ({
  selectedRouteData,
  isMapReady,
  drawNavigationPath,
  setCurrentInstruction,
  setInstructionList,
  setCurrentIntervalIndex,
  refs,
}: UseNavigationDataApplyParams) => {
  const applyNavigationData = useCallback(
    (
      navigationData: ApplyNavigationDataInput,
      walkingPolicy: NavigationWalkingPolicy = 'all',
    ) => {
      if (
        !navigationData.coordinates ||
        navigationData.coordinates.length === 0
      ) {
        return;
      }
      // Ref 데이터 업데이트 (좌표, 지시사항)
      refs.fullPathCoordinateList.current = navigationData.coordinates;
      refs.instructionList.current = navigationData.instructions;

      // TTS 및 preview 관련 상태 설정
      const firstInst = navigationData.instructions[0];
      const secondInst = navigationData.instructions[1];

      refs.currentTtsUrl.current = firstInst?.ttsUrl ?? null;
      refs.previewInstructionText.current = secondInst?.text ?? '';
      refs.previewTtsUrl.current = secondInst?.ttsUrl ?? null;
      refs.previewSign.current = secondInst?.sign ?? null;

      // 현재 instruction 및 turn 좌표 설정
      if (firstInst) {
        setCurrentInstruction(firstInst);
        refs.nextTurnCoordinate.current = firstInst.nextTurnCoordinate;

        // 네비게이션 디테일 모달 상태 초기화
        setInstructionList(navigationData.instructions);
        setCurrentIntervalIndex(0);
      }

      // currentIntervalIndex 리셋
      refs.currentIntervalIndex.current = 0;

      // pathDataListByInterval 재구성
      refs.pathDataListByInterval.current = [];
      refs.pathDataListByInterval.current = navigationData.instructions.map(
        (inst, idx) => {
          const [start, end] = inst.interval;
          return {
            intervalIndex: idx,
            interval: inst.interval,
            coordinateList: navigationData.coordinates
              .slice(start, end + 1)
              .map(coord => ({ lat: coord[1], lng: coord[0] })),
          };
        },
      );

      // 턴 관련 상태 리셋
      refs.isEnteredRef.current = false;
      refs.passCountRef.current = 0;
      refs.lastDistanceFromMyPosToNextTurnPosRef.current = null;
      refs.prevMyPositionForTurnRef.current = null;
      refs.prevTimestampForTurnRef.current = null;
      refs.previewEnterCount.current = 0;

      // 거리/측정 기준 리셋 (재탐색 시 remaining/interval 갱신을 즉시 반영)
      refs.prevTimestampForDistanceRef &&
        (refs.prevTimestampForDistanceRef.current = null);
      refs.prevMyPositionForDistanceRef &&
        (refs.prevMyPositionForDistanceRef.current = null);
      refs.prevTraveledDistanceMeterRef &&
        (refs.prevTraveledDistanceMeterRef.current = 0);
      refs.prevRemainingDistanceMeterRef &&
        (refs.prevRemainingDistanceMeterRef.current = Number.POSITIVE_INFINITY);
      refs.prevTimestampForMeasureRef &&
        (refs.prevTimestampForMeasureRef.current = null);
      refs.prevTraveledDistanceForMeasureRef &&
        (refs.prevTraveledDistanceForMeasureRef.current = null);

      // 네비게이션 경로 그리기
      if (selectedRouteData && isMapReady) {
        // routeType은 useRouteStore의 routeType 사용
        const storeRouteType = useRouteStore.getState().routeType;
        const routeType =
          storeRouteType === 'loop' ? RouteType.LOOP : RouteType.CONSTANT;

        // 실제 출발지/도착지 좌표
        const coordinates = navigationData.coordinates;
        const startPoint: [number, number] = coordinates[0];
        const endPoint: [number, number] = coordinates[coordinates.length - 1];

        const intervals = navigationData.instructions.map(
          instruction => instruction.interval,
        );

        // 대여소 정보: 새로운 정보가 있으면 사용, 없으면 selectedRouteData 사용
        const startStation =
          navigationData.startStation ?? selectedRouteData.startStation;
        const endStation =
          navigationData.endStation ??
          selectedRouteData.endStation ??
          startStation;

        if (!startStation) return;

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
            : { lat: endStation.lat, lng: endStation.lng };

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
          walkingPolicy,
        });
      }
    },
    [
      selectedRouteData,
      isMapReady,
      drawNavigationPath,
      setCurrentInstruction,
      setInstructionList,
      setCurrentIntervalIndex,
    ],
  );

  return { applyNavigationData };
};
