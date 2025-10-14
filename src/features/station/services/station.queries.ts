import {
  GetLatestStationsInventoriesPayload,
  MapAreaQueryPayload,
  NearbyStationsPayload,
} from '@/features/station/model/station.types';
import {
  getMapAreaStations,
  getNearbyStations,
  postGetLatestStationsInventories,
} from '@/features/station/services/station.api';
import { stationKeys } from '@/features/station/services/station.key';
import { useNetInfo } from '@react-native-community/netinfo';
import { useIsFocused } from '@react-navigation/native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { cache, useEffect, useState } from 'react';
import { Alert, AppState } from 'react-native';

// 가장 가까운 대여소 3개 조회 - 버튼을 눌렀을 때만 조회
export const useNearbyStationsMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: NearbyStationsPayload) => getNearbyStations(payload),
  });
  return mutation;
};

// 고려사항 정리:
// 맵센터가 바뀌면 해당 센터를 기준으로 반경안에 들어오는 대여소 정보를 조회
// 즉 최신정보로의 갱신 트리거는 기본적으로 맵센터 변경(idle)임
// 해당 트리거가 발동하지 않으면 최신 bike정보를 갖고오지 않음
// 따라서 사용자가 가만히 있어도 적당한 간격으로 실시간 바이크 정보를 가져오는 조건로직이 필요
// 추가조건: 리패치조건을 충분히 거리이동을 했을때로 제한할 필요가 있음
// -> 너무 자주 idle이벤트가 들어오면 api요청이 너무 많아짐
// -> 적당한 거리이동(예: 200m) 후에만 refetch되도록 처리 필요
// -> 이 부분은 부모에서 처리
// 지도 초기화 후 1번은 강제 리패치 필요, enable의 용도는 idle이벤트가 RN으로 잘 넘어와요에 초점
// 지도 특정 영역 내 대여소 조회 - 포그라운드 + 지도 이동 시마다 자동 조회(단 idle + 추가조건 존재)
// 추가조건1: 움직이지 않아도 일정주기로 리패치 -> 내부에서 처리
// 추가조건2: 충분히 많이 움직였을때 -> 외부에서 처리
// 절대조건: 맵을 볼때만!!!!!!!!!!!
// 두 조건은 겹쳐도 된다

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
        console.log(response);
        return response;
      }
      return [];
    },
    enabled: canRun, // enable은 최초실행 주기적 리패치 모두 막아줌!!! 단 강제로 리패치함수 쓰면 무효
    staleTime: 1000 * 60 * 60 * 24 * 7,
    gcTime: Infinity,
    // 리패치인터벌은 불필요: 왜냐하면 바이크수 동기화 api가 따로있기때문
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });
};

// 대여소 재고 정보 조회
export const useGetLatestStationsInventoriesMutation = () => {
  const mutation = useMutation({
    mutationFn: (payload: GetLatestStationsInventoriesPayload) =>
      postGetLatestStationsInventories(payload),
  });
  return mutation;
};
