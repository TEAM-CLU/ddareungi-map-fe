import {
  GetStationLatestBikeCountListPayload,
  MapAreaQueryPayload,
} from '@/features/station/model/station.types';
import {
  getMapAreaStationList,
  getNearbyStationList,
  postStationLatestBikeCountList,
} from '@/features/station/services/station.api';
import { stationKeys } from '@/features/station/services/station.key';
import { useIsFocused } from '@react-navigation/native';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { AppState } from 'react-native';

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
  const netInfo = useNetInfo();
  const isFocusedMap = useIsFocused();

  const [isAppActive, setIsAppActive] = useState(true);

  const isOnline = !!(netInfo.isConnected && netInfo.isInternetReachable);
  const canRun = !!(payload.enable && isAppActive && isOnline && isFocusedMap);

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener('change', state =>
      setIsAppActive(state === 'active'),
    );
    return () => appStateSubscription.remove();
  }, []);

  return useQuery({
    // 좌표 바뀌면 키도 바뀌어야 재요청
    queryKey: stationKeys.mapArea(payload.lat, payload.lng, payload.radius),
    queryFn: async ({ signal }) => {
      if (!!payload.lat && !!payload.lng && !!payload.radius) {
        const response = await getMapAreaStationList(
          {
            latitude: payload.lat,
            longitude: payload.lng,
            radius: payload.radius,
          },
          signal,
        );
        return response;
      }
      return [];
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
