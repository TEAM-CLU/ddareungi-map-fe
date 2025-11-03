import {
  GetStationsLatestBikeCountPayload,
  MapAreaQueryPayload,
  NearbyStationsPayload,
} from '@/features/station/model/station.types';
import {
  getMapAreaStations,
  getNearbyStations,
  postStationsLatestBikeCount,
} from '@/features/station/services/station.api';
import { stationKeys } from '@/features/station/services/station.key';
import { useNetInfo } from '@react-native-community/netinfo';
import { useIsFocused } from '@react-navigation/native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

// 가장 가까운 대여소 3개 조회 - 버튼을 눌렀을 때만 조회
export const useNearbyStationsMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: NearbyStationsPayload) => getNearbyStations(payload),
  });
  return mutation;
};

// 지도 특정 영역 내 대여소 조회
export const useStationsDataQuery = (payload: MapAreaQueryPayload) => {
  const [isAppActive, setIsAppActive] = useState(true);

  const netInfo = useNetInfo();
  const isFocusedMap = useIsFocused();

  useEffect(() => {
    const sub = AppState.addEventListener('change', state =>
      setIsAppActive(state === 'active'),
    );
    return () => sub.remove();
  }, []);

  const isOnline = !!(netInfo.isConnected && netInfo.isInternetReachable);
  const canRun = !!(payload.enable && isAppActive && isOnline && isFocusedMap);

  return useQuery({
    queryKey: stationKeys.mapArea(),
    queryFn: async ({ signal }) => {
      if (!!payload.lat && !!payload.lon && !!payload.radius) {
        const response = await getMapAreaStations(
          {
            latitude: payload.lat,
            longitude: payload.lon,
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
  const mutation = useMutation({
    mutationFn: (payload: GetStationsLatestBikeCountPayload) =>
      postStationsLatestBikeCount(payload),
  });
  return mutation;
};
