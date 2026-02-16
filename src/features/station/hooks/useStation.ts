import { useCallback, useEffect, useRef, useState } from 'react';
import { WebViewMessageEvent } from 'react-native-webview';
import { Coordinate } from '@/shared/model/shared.types';
import {
  useGetStationsLatestBikeCountMutation,
  useStationDataListQuery,
} from '@/features/station/services/station.queries';
import { StationLatestBikeCountData } from '@/features/station/model/station.types';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useStationStore } from '../stores/useStationStore';
import { useStationMessenger } from '@/features/station/hooks/useStationMessenger';
import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore';
import { useShallow } from 'zustand/react/shallow';
import { getDistanceBetweenCoords } from '@/shared/utils/measure';
import { handleCatch } from '@/shared/utils/errorHandler';

interface UseStationParams {
  isMapReady: boolean;
  mapReadyVersion: number;
}

export const useStation = ({
  isMapReady,
  mapReadyVersion,
}: UseStationParams) => {
  const { updateStationDataList, updateTargetedStationBikeCountListMessage } =
    useStationMessenger();
  const { mutateAsync: getLatestBikeCountList } =
    useGetStationsLatestBikeCountMutation();
  const isNavigationMode = useNavigationStore(state => state.isNavigationMode);
  const { setShowStationDetailModal, showSelectedRouteDetailModal } =
    useModalStore(
      useShallow(state => ({
        setShowStationDetailModal: state.setShowStationDetailModal,
        showSelectedRouteDetailModal: state.showSelectedRouteDetailModal,
      })),
    );
  const setStationMetaData = useStationStore(state => state.setStationMetaData);

  // 쿼리를 트리거하기 위한 "현재 보고 있는 지도 중심점"
  const [currentMapCenterCoord, setCurrentMapCenterCoord] =
    useState<Coordinate | null>(null);

  // 거리 계산을 위해 "직전에 로딩했던 좌표" 기억용
  const prevMapCenterCoord = useRef<Coordinate | null>(null);

  // 조건: 지도 로딩 완료 + 네비 모드 아님 + 경로 상세 모달 아님
  const enableQuery =
    isMapReady && !isNavigationMode && !showSelectedRouteDetailModal;
  const { data: stationDataList } = useStationDataListQuery({
    lat: currentMapCenterCoord?.lat,
    lng: currentMapCenterCoord?.lng,
    radius: 1500,
    enable: enableQuery,
  });

  // 메세지 핸들러
  // 웹뷰에서 오는 메세지 한 곳에서 처리
  const handleStationMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      let data: any;

      // 1. JSON 파싱 시도
      try {
        data = JSON.parse(event.nativeEvent.data);
      } catch (error) {
        handleCatch(error, { mode: 'silent' });
        return;
      }

      // 2. 파싱된 데이터 로직 수행
      try {
        switch (data.type) {
          // 1. 지도 이동 멈춤 (Idle)
          // 일정 거리 이상 움직였을 때만 상태 업데이트 -> 쿼리 자동 실행
          case 'changeMapCenter': {
            if (typeof data.lat !== 'number' || typeof data.lng !== 'number') {
              return;
            }

            const next: Coordinate = { lat: data.lat, lng: data.lng };
            const prev = prevMapCenterCoord.current;

            const isMovedEnough = prev
              ? getDistanceBetweenCoords(prev, next) >= 1000
              : true;

            if (isMovedEnough) {
              setCurrentMapCenterCoord(next);
              prevMapCenterCoord.current = next;
            }
            break;
          }

          // 2. 특정 대여소 실시간 재고 조회 요청
          case 'needUpdateStationBikeCountList': {
            if (
              !Array.isArray(data.stationNumbers) ||
              data.stationNumbers.length === 0
            ) {
              return;
            }

            try {
              const response: StationLatestBikeCountData[] =
                await getLatestBikeCountList({
                  stationNumbers: data.stationNumbers,
                });
              updateTargetedStationBikeCountListMessage(response);
            } catch (error) {
              handleCatch(error, { mode: 'silent' });
            }
            break;
          }

          // 3. 대여소 마커 클릭
          case 'clickStationMarker': {
            if (!data.stationData) {
              return;
            }

            if (setStationMetaData) {
              setStationMetaData(data.stationData);
            }
            setShowStationDetailModal(true);
            break;
          }

          default:
            break;
        }
      } catch (error) {
        handleCatch(error, { mode: 'silent' });
      }
    },
    [
      getLatestBikeCountList,
      setShowStationDetailModal,
      setStationMetaData,
      updateTargetedStationBikeCountListMessage,
    ],
  );

  // 쿼리 데이터가 갱신되면 웹뷰에 전달
  useEffect(() => {
    if (!enableQuery || !stationDataList) return;
    updateStationDataList(stationDataList);
  }, [stationDataList, updateStationDataList, enableQuery, mapReadyVersion]);

  return {
    handleStationMessage,
  };
};
