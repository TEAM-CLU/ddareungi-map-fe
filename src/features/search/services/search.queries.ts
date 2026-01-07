import { PlaceInfo, SearchOptions } from '../model/search.types';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  reverseGeocode,
  searchAddressCoordinates,
  searchPlacesByKeyword,
} from './search.api';
import {
  clearRecentSearchHistory,
  getRecentSearches,
  removeRecentSearchItem,
  saveRecentSearch,
} from '../libs/recentSearch';
import { placeKeys } from './search.key';

// -----------------------------------------------------------
// 1. 무한 스크롤 검색 훅
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
    retry: 0,
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
      // enabled 조건에서 이미 lat, lon이 존재함이 보장되므로 non-null 단언 연산자 사용
      return reverseGeocode(lat!, lon!, signal);
    },
    enabled: !!lat && !!lon,
    staleTime: 1000 * 60 * 60, // 1시간 (건물 이름이 자주 바뀌진 않음)
    placeholderData: keepPreviousData, // 위치가 살짝 바뀌어도 이전 주소를 보여주다가 갱신 (깜빡임 방지)
    refetchOnWindowFocus: false,
  });
};

// -----------------------------------------------------------
// 5. 최근 검색 기록 저장 훅
// -----------------------------------------------------------
export const useRecentSearchesQuery = () => {
  const queryClient = useQueryClient();

  // 1. [조회] 로컬 스토리지에서 가져오기
  const query = useQuery({
    queryKey: placeKeys.recentSearch,
    queryFn: getRecentSearches,
    staleTime: Infinity, // 최근 검색 기록은 수시로 변하지 않으므로 무한대로 설정
    gcTime: Infinity,
    initialData: [],
  });

  // 2. [추가] 검색어 저장
  const addMutation = useMutation({
    mutationFn: (place: PlaceInfo) => {
      // 현재 캐시된 목록을 가져와서 함께 넘김
      const currentList = query.data || [];
      return saveRecentSearch(currentList, place);
    },
    onSuccess: updatedList => {
      // 저장 완료되면 캐시 즉시 업데이트 (UI 바로 반영)
      queryClient.setQueryData(placeKeys.recentSearch, updatedList);
    },
  });

  // 3. [삭제] 개별 삭제
  const removeMutation = useMutation({
    mutationFn: (id: string) => {
      const currentList = query.data || [];
      return removeRecentSearchItem(currentList, id);
    },
    onSuccess: updatedList => {
      queryClient.setQueryData(placeKeys.recentSearch, updatedList);
    },
  });

  // 4. [전체 삭제] 초기화
  const clearMutation = useMutation({
    mutationFn: clearRecentSearchHistory,
    onSuccess: () => {
      queryClient.setQueryData(placeKeys.recentSearch, []);
    },
  });

  return {
    recentSearches: query.data,
    isLoading: query.isLoading,
    addRecentSearch: addMutation.mutate,
    removeRecentSearch: removeMutation.mutate,
    clearRecentSearches: clearMutation.mutate,
  };
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
