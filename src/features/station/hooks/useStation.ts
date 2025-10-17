import { RefObject, useEffect, useRef, useState } from 'react';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { Coordinates } from '@/features/map/model/map.types';
import { getDistanceBetweenCoords } from '@/features/location/utils/location';
import {
  useGetLatestStationsInventoriesMutation,
  useStationsDataQuery,
} from '@/features/station/services/station.queries';
import {
  LatestStationsInventoriesData,
  MapAreaQueryPayload,
  MapAreaStationsData,
} from '@/features/station/model/station.types';
import { Alert } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  StationsDataUpdateMessage,
  UpdateTargetedStationsInventoriesMessage,
} from '@/shared/model/map.webview.types';

interface UseStationsProps {
  webRef: RefObject<WebView | null>;
  isMapReady: boolean; // Map 컴포넌트의 isMapReady 그대로 전달
  setStationMetaData?: React.Dispatch<
    React.SetStateAction<MapAreaStationsData | null>
  >;
  stationDetailModalRef?: RefObject<BottomSheetModal | null>;
}

export const useStation = ({
  webRef,
  isMapReady,
  setStationMetaData,
  stationDetailModalRef,
}: UseStationsProps) => {
  const [mapCenterCoord, setMapCenterCoord] = useState<Coordinates | null>(
    null,
  );
  const prevMapCenterCoord = useRef<Coordinates | null>(null);
  const [isIdleEventOccuerred, setIsIdleEventOccuerred] = useState(false);

  // 범위 내 대여소 데이터 조회 쿼리 파라미터
  const stationDataQueryPayload: MapAreaQueryPayload = {
    lat: mapCenterCoord?.lat ?? null,
    lon: mapCenterCoord?.lon ?? null,
    radius: 1500, // 반경 설정
    enable: isIdleEventOccuerred, // idle 이벤트 최초 발생시 계속 enable
  };

  const { data: stationsData, refetch: refetchStationsData } =
    useStationsDataQuery(stationDataQueryPayload);

  const { mutateAsync: getCurrentBikesList } =
    useGetLatestStationsInventoriesMutation();

  const handleMapCenterChanged = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type !== 'mapCenterChanged') return;

      const next: Coordinates = { lat: data.lat, lon: data.lon };
      const prev = prevMapCenterCoord.current;
      const isMovedEnough = prev
        ? getDistanceBetweenCoords(prev, next) >= 1000 // 1km 이상 이동했을때만
        : true; // 최초 한번은 무조건 리패치

      if (isMovedEnough) {
        setIsIdleEventOccuerred(true);
        setMapCenterCoord(next);
        prevMapCenterCoord.current = next;
      }
      return;
    } catch (error) {
      console.error('Invalid JSON from WebView:', error);
    }
  };

  // 스테이션 재고정보 요청이 오면 최신정보 조회후 웹뷰에 전달
  const handleStationsInventoriesUpdate = async (
    event: WebViewMessageEvent,
  ) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type !== 'needUpdateStationInventories') return;
      const targetedStationsNumberList = data.stationNumbers;

      if (targetedStationsNumberList.length === 0) return;
      const response: LatestStationsInventoriesData[] =
        await getCurrentBikesList({
          stationNumbers: targetedStationsNumberList,
        });
      const targetedStations: UpdateTargetedStationsInventoriesMessage = {
        type: 'updateTargetedStationsInventories',
        inventories: response,
      };
      webRef.current?.postMessage(JSON.stringify(targetedStations));
    } catch (error) {
      console.error('Invalid JSON from WebView:', error);
    }
  };

  // set함수의 비동기 반영 문제 해결을 위한 조치(센터좌표가 한발자국씩 늦게 따라오는 점 해소)
  useEffect(() => {
    if (!mapCenterCoord) return;
    // 최초 1회 또는 isIdleEventOccuerred가 true일 때만
    if (isIdleEventOccuerred) {
      refetchStationsData({ cancelRefetch: true });
    }
  }, [mapCenterCoord, isIdleEventOccuerred, refetchStationsData]);

  // 클릭이벤트로 스테이션 상세정보 요청이 오면 모달 오픈
  const handleStationMarkerClick = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type !== 'stationMarkerClicked') return;
      // 스테이션 상세정보 모달 오픈
      if (!stationDetailModalRef?.current) return;
      stationDetailModalRef.current?.present();

      // 모달에 필요한 상세정보 상태에 저장
      if (!setStationMetaData) return;
      setStationMetaData(data.stationData);
      return;
    } catch (error) {
      console.error('Invalid JSON from WebView:', error);
    }
  };

  // 스테이션 데이터가 갱신되면 웹뷰에 전달
  useEffect(() => {
    if (!isMapReady || !stationsData) return;
    const updatedStationData: StationsDataUpdateMessage = {
      type: 'stationsDataUpdate',
      stations: stationsData,
    };
    webRef.current?.postMessage(JSON.stringify(updatedStationData));
  }, [stationsData, isMapReady, webRef]);

  return {
    handleMapCenterChanged,
    handleStationsInventoriesUpdate,
    handleStationMarkerClick,
  };
};
