import { GetStationLatestBikeCountListPayload, MapAreaQueryPayload } from '@/features/station/model/station.types';
import {
  getMapAreaStationList,
  getNearbyStationList,
  postStationLatestBikeCountList,
} from '@/features/station/services/station.api';
import { stationKeys } from '@/features/station/services/station.key';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

// 가장 가까운 대여소 3개 조회
export const useNearbyStationsQuery = (lat?: number, lng?: number) => {
  const canRun = !!lat && !!lng;

  return useQuery({
    queryKey: stationKeys.nearby(lat, lng),
    queryFn: () => getNearbyStationList({ latitude: lat!, longitude: lng! }),
    enabled: canRun,
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData, // 위치 바뀌어 새 데이터 가져오는 동안 이전 데이터 화면에 유지
  });
};

// 지도 특정 영역 내 대여소 조회
export const useStationDataListQuery = (payload: MapAreaQueryPayload) => {
  // 실행 조건: 위도, 경도, 반경이 모두 있고 + enable 플래그가 true일 때
  const canRun =
    !!payload.lat && !!payload.lng && !!payload.radius && !!payload.enable;

  return useQuery({
    // 좌표 바뀌면 키도 바뀌어야 재요청
    queryKey: stationKeys.mapArea(payload.lat, payload.lng, payload.radius),
    queryFn: ({ signal }) => {
      return getMapAreaStationList(
        {
          latitude: payload.lat!,
          longitude: payload.lng!,
          radius: payload.radius!,
        },
        signal,
      );
    },
    enabled: canRun,
    staleTime: 1000 * 60 * 60 * 24 * 7,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });
};

// 대여소 재고 정보 조회
export const useGetStationsLatestBikeCountMutation = () => {
  return useMutation({
    mutationFn: (payload: GetStationLatestBikeCountListPayload) =>
      postStationLatestBikeCountList(payload),
  });
};
