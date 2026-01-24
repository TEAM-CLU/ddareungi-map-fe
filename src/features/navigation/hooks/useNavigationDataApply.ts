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
      // coordinates와 instructions 적용
      refs.fullPathCoordinateList.current = navigationData.coordinates;
      refs.instructionList.current = navigationData.instructions;

      // TTS 및 preview 관련 상태 설정
      refs.currentTtsUrl.current =
        navigationData.instructions.length > 0
          ? navigationData.instructions[0].ttsUrl
          : null;
      refs.previewInstructionText.current =
        navigationData.instructions.length > 1
          ? navigationData.instructions[1].text
          : '';
      refs.previewTtsUrl.current =
        navigationData.instructions.length > 1
          ? navigationData.instructions[1].ttsUrl
          : null;
      refs.previewSign.current =
        navigationData.instructions.length > 1
          ? navigationData.instructions[1].sign
          : null;

      // 현재 instruction 및 turn 좌표 설정
      if (navigationData.instructions.length > 0) {
        setCurrentInstruction(navigationData.instructions[0]);
        refs.nextTurnCoordinate.current =
          navigationData.instructions[0].nextTurnCoordinate;

        // 네비게이션 디테일 모달 상태 초기화
        setInstructionList(navigationData.instructions);
        setCurrentIntervalIndex(0);
      }

      // currentIntervalIndex 리셋
      refs.currentIntervalIndex.current = 0;

      // pathDataListByInterval 재구성
      refs.pathDataListByInterval.current = [];
      for (let i = 0; i < navigationData.instructions.length; i++) {
        const interval = navigationData.instructions[i].interval;
        const segmentCoordinates = navigationData.coordinates
          .slice(interval[0], interval[1] + 1)
          .map(coord => ({ lat: coord[1], lng: coord[0] }));
        refs.pathDataListByInterval.current.push({
          intervalIndex: i,
          interval,
          coordinateList: segmentCoordinates,
        });
      }

      // 턴 관련 상태 리셋
      refs.isEnteredRef.current = false;
      refs.passCountRef.current = 0;
      refs.lastDistanceFromMyPosToNextTurnPosRef.current = null;
      refs.prevMyPositionForTurnRef.current = null;
      refs.prevTimestampForTurnRef.current = null;
      refs.previewEnterCount.current = 0;

      // 거리/측정 기준 리셋 (재탐색 시 remaining/interval 갱신을 즉시 반영)
      if (refs.prevTimestampForDistanceRef) {
        refs.prevTimestampForDistanceRef.current = null;
      }
      if (refs.prevMyPositionForDistanceRef) {
        refs.prevMyPositionForDistanceRef.current = null;
      }
      if (refs.prevTraveledDistanceMeterRef) {
        refs.prevTraveledDistanceMeterRef.current = 0;
      }
      if (refs.prevRemainingDistanceMeterRef) {
        refs.prevRemainingDistanceMeterRef.current = Number.POSITIVE_INFINITY;
      }
      if (refs.prevTimestampForMeasureRef) {
        refs.prevTimestampForMeasureRef.current = null;
      }
      if (refs.prevTraveledDistanceForMeasureRef) {
        refs.prevTraveledDistanceForMeasureRef.current = null;
      }

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
