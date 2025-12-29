import { PlaceInfo, SearchOptions } from '../model/search.types';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import {
  reverseGeocode,
  searchAddressCoordinates,
  searchPlacesByKeyword,
} from './search.api';

// -----------------------------------------------------------
// 1. 쿼리 키 팩토리 (Query Key Factory)
// - 키 관리를 한곳에서 하여 오타를 방지하고 캐시 제어를 쉽게 함
// -----------------------------------------------------------
export const placeKeys = {
  // 1. 가장 큰 대분류 이름표
  all: ['places'] as const,

  // 2. 검색어용 이름표 생성 함수
  // 사용법: placeKeys.keyword('강남') -> ['places', 'keyword', '강남'] 이 자동 생성됨
  keyword: (query: string, options?: SearchOptions) =>
    [...placeKeys.all, 'keyword', query, options] as const,

  // 3. 주소 검색용 이름표 생성 함수
  // 사용법: placeKeys.address('서울시...') -> ['places', 'address', '서울시...'] 생성됨
  address: (address: string) => [...placeKeys.all, 'address', address] as const,

  // 4. 역지오코딩용 이름표 생성 함수
  // 사용법: placeKeys.reverse(37.5, 127.0) -> ['places', 'reverse', 37.5, 127.0] 생성됨
  reverse: (lat: number | undefined, lon: number | undefined) =>
    [...placeKeys.all, 'reverse', lat, lon] as const,
};

// -----------------------------------------------------------
// 2. 무한 스크롤 검색 훅
// -----------------------------------------------------------
export const useInfinitePlaceSearch = (
  query: string,
  options: Omit<SearchOptions, 'page'> = {}, // page는 내부에서 자동 관리
) => {
  return useInfiniteQuery<PlaceInfo[], Error>({
    queryKey: placeKeys.keyword(query, options),

    queryFn: async ({ pageParam = 1, signal }) => {
      // API 함수에 signal을 넘겨주면,
      // 사용자가 타자를 빨리 칠 때 이전 요청이 자동 취소됨 (네트워크 낭비 방지)
      return searchPlacesByKeyword(
        query,
        { ...options, page: pageParam as number },
        signal,
      );
    },

    initialPageParam: 1,

    // 다음 페이지가 있는지 계산하는 로직
    getNextPageParam: (lastPage, allPages) => {
      const currentSize = options.size || 15;
      // 받아온 개수가 요청한 개수보다 적으면 마지막 페이지로 간주
      return lastPage.length < currentSize ? undefined : allPages.length + 1;
    },

    // [실행 조건] 검색어가 비어있지 않을 때만 실행
    enabled: !!query.trim(),

    // [캐시 옵션]
    staleTime: 1000 * 60 * 5, // 5분간 데이터를 신선한 것으로 간주 (재요청 안 함)
    gcTime: 1000 * 60 * 30, // 30분간 캐시 메모리에 보관

    refetchOnWindowFocus: false, // 앱 전환했다 돌아왔을 때 깜빡임 방지
    retry: 1, // 실패 시 1번만 재시도 (404 등은 재시도 의미가 없으므로)
  });
};

// -----------------------------------------------------------
// 3. 주소 -> 좌표 변환 훅
// -----------------------------------------------------------
export const useAddressCoordinateQuery = (address: string) => {
  return useQuery<PlaceInfo | null, Error>({
    queryKey: placeKeys.address(address),
    queryFn: ({ signal }) => searchAddressCoordinates(address, signal),
    enabled: !!address.trim(),
    staleTime: Infinity, // 주소 좌표는 거의 변하지 않으므로 아주 길게 설정
    refetchOnWindowFocus: false, // 주소가 틀린 거면 재시도해도 똑같으므로 끔
  });
};

// -----------------------------------------------------------
// 4. 좌표 -> 주소 변환 훅 (역지오코딩)
// -----------------------------------------------------------
export const useReverseGeocodeQuery = (
  lat: number | undefined,
  lon: number | undefined,
) => {
  return useQuery<PlaceInfo | null, Error>({
    queryKey: placeKeys.reverse(lat, lon),
    queryFn: ({ signal }) => {
      if (!lat || !lon) throw new Error('Invalid coordinates');
      return reverseGeocode(lat, lon, signal);
    },
    enabled: !!lat && !!lon,
    staleTime: 1000 * 60 * 60, // 1시간 (건물 이름이 자주 바뀌진 않음)
    placeholderData: keepPreviousData, // 위치가 살짝 바뀌어도 이전 주소를 보여주다가 갱신 (깜빡임 방지)
    refetchOnWindowFocus: false,
  });
};

// 키워드로 장소 검색
// export const useSearchPlacesByKeywordQuery = (
//   query: string,
//   options: SearchOptions = {},
// ) => {
//   const [isAppActive, setIsAppActive] = useState(true);

//   const netInfo = useNetInfo();
//   const isFocusedScreen = useIsFocused();

//   useEffect(() => {
//     const sub = AppState.addEventListener('change', state =>
//       setIsAppActive(state === 'active'),
//     );
//     return () => sub.remove();
//   }, []);

//   const isOnline = !!(netInfo.isConnected && netInfo.isInternetReachable);
//   const canRun = !!(query.trim() && isAppActive && isOnline && isFocusedScreen);

//   return useQuery({
//     queryKey: ['searchPlacesByKeyword', query, options],
//     queryFn: async ({ signal }) => {
//       const response = await searchPlacesByKeyword(query, options, signal);
//       return response;
//     },
//     enabled: canRun,
//     staleTime: 1000 * 60 * 5, // 5m
//     gcTime: 1000 * 60 * 60 * 24,
//     refetchOnWindowFocus: false,
//     refetchIntervalInBackground: false,
//     placeholderData: keepPreviousData, // 검색어 입력 중 깜빡임 방지
//   });
// };
