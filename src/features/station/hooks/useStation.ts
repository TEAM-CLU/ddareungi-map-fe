import { useCallback, useEffect, useRef, useState } from 'react';
import { WebViewMessageEvent } from 'react-native-webview';
import { Coordinates } from '@/features/map/model/map.types';
import { getDistanceBetweenCoords } from '@/features/location/utils/location';
import {
  useGetStationsLatestBikeCountMutation,
  useStationDataListQuery,
} from '@/features/station/services/station.queries';
import {
  StationLatestBikeCountData,
  UseStationsOptions,
} from '@/features/station/model/station.types';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useStationStore } from '../stores/useStationStore';
import { useStationMessenger } from '@/features/station/hooks/useStationMessenger';
import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore';

export const useStation = ({ isMapReady }: UseStationsOptions) => {
  const { updateStationDataList, updateTargetedStationBikeCountListMessage } =
    useStationMessenger();
  const { isNavigationMode } = useNavigationStore();
  const { setShowStationDetailModal, showSelectedRouteDetailModal } =
    useModalStore();
  const { setStationMetaData } = useStationStore();


  // 쿼리를 트리거하기 위한 "현재 보고 있는 지도 중심점"
  const [currentMapCenterCoord, setCurrentMapCenterCoord] =
    useState<Coordinates | null>(null);

  // 거리 계산을 위해 "직전에 로딩했던 좌표" 기억용
  const prevMapCenterCoord = useRef<Coordinates | null>(null);

  // 조건: 지도 로딩 완료 + 네비 모드 아님 + 경로 상세 모달 아님
  const enableQuery =
    isMapReady && !isNavigationMode && !showSelectedRouteDetailModal;

  const { data: stationDataList } = useStationDataListQuery({
    lat: currentMapCenterCoord?.lat,
    lng: currentMapCenterCoord?.lng,
    radius: 1500,
    enable: enableQuery,
  });

  const { mutateAsync: getLatestBikeCountList } =
    useGetStationsLatestBikeCountMutation();

  // 메세지 핸들러
  // 웹뷰에서 오는 메세지 한 곳에서 처리
  const handleStationMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        switch (data.type) {
          // 1. 지도 이동 멈춤 (Idle)
          // 일정 거리 이상 움직였을 때만 상태 업데이트 -> 쿼리 자동 실행
          case 'changeMapCenter': {
            const next: Coordinates = { lat: data.lat, lng: data.lng };
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
            const { stationNumbers } = data;
            if (stationNumbers.length === 0) return;

            const response: StationLatestBikeCountData[] =
              await getLatestBikeCountList({
                stationNumbers,
              });
            updateTargetedStationBikeCountListMessage(response);
            break;
          }

          // 3. 대여소 마커 클릭
          case 'clickStationMarker': {
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
        console.error('Invalid JSON from WebView:', error);
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
  }, [stationDataList, updateStationDataList, enableQuery]);

  return {
    handleStationMessage,
  };
};
