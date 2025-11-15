import { useCallback, useEffect, useState } from 'react';
import { searchPlacesByKeyword } from '../services/search.api';
import { SearchOptions } from '../model/search.types';
import { SEARCH_CONSTANTS } from '../model/search.constants';
import { useMapController } from '@/shared/hooks/useMapController';

// 자동완성 검색 결과 타입
export interface AutocompleteResult {
  placeKey: string;   // 장소 고유 ID
  name: string;       // 장소명 (예: 스타벅스 강남점)
  address: string;    // 주소 (예: 서울 강남구...)
  latitude?: number;  // 위도
  longitude?: number; // 경도
  distance?: string;  // 현재 위치로부터의 거리 (m)
  category?: string;  // 장소 카테고리 (카페, 음식점 등)
}

interface UseAutocompleteOptions {
  // 디바운싱 지연 시간
  autoSearchDelay?: number;
}

export const useAutocomplete = (options: UseAutocompleteOptions = {}) => {
  const {
    autoSearchDelay = SEARCH_CONSTANTS.DEFAULT_DEBOUNCE_DELAY,
  } = options;

  // ------------ 로컬 상태 -------------
  const [query, setQuery] = useState(''); // 현재 입력된 검색어
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AutocompleteResult[]>([]); // 검색 결과 리스트
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null); // 디바운스 타이머

  const { myPosition } = useMapController();

  // ------------- API 호출 -------------
  // 자동완성 검색 실행
  const performAutocompleteSearch = useCallback(
    async (searchQuery: string) => {
      const trimmedQuery = searchQuery.trim();

      // 1. 최소 길이 검증
      if (
        !trimmedQuery ||
        trimmedQuery.length < SEARCH_CONSTANTS.MIN_SEARCH_LENGTH
      ) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 현재 위치 있으면 거리순, 없으면 정확도순
        const searchOptions: SearchOptions = myPosition
          ? {
              x: myPosition.lon,
              y: myPosition.lat,
              radius: SEARCH_CONSTANTS.DEFAULT_SEARCH_RADIUS,
              sort: SEARCH_CONSTANTS.SORT_OPTIONS.DISTANCE,
            }
          : {
              sort: SEARCH_CONSTANTS.SORT_OPTIONS.ACCURACY,
            };

        // 3. API 호출
        const searchResults = await searchPlacesByKeyword(
          searchQuery,
          searchOptions,
        );

        // 4. 데이터 정규화
        // API 응답을 UI 컴포넌트가 쓰기 좋은 형태(AutocompleteResult)로 변환
        const autocompleteResults: AutocompleteResult[] = searchResults.map(
          place => ({
            placeKey: place.id,
            name: place.name,
            address: place.address,
            latitude: place.latitude,
            longitude: place.longitude,
            distance: place.distance,
            category: place.category,
          }),
        );

        setResults(autocompleteResults);
      } catch (err) {
        console.error('Autocomplete search failed:', err);
        setError(SEARCH_CONSTANTS.ERROR_MESSAGES.SEARCH_FAILED);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [myPosition],
  );

  // ------------- 이벤트 핸들러 -------------

  /*
    검색어 변경 처리 - 사용자 입력마다 API 호출 방지
  */
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery); // 1. 화면의 글자는 즉시 업데이트
      setError(null); // 2. 에러 초기화

      // 3. 기존 타이머 정리 (이전 검색 요청 취소)
      // 사용자가 타자 치는 중이라면 이전 예약된 API 호출 막음
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // 4. 검색어가 다 지워졌으면 결과 초기화
      if (!newQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      // 5. 타이핑이 시작되면 즉시 로딩 상태로 변경
      setIsLoading(true);

      // 6. 새 타이머 설정
      // "autoSearchDelay(예: 200ms) 동안 더 이상 입력이 없으면 검색해라"
      const timer = setTimeout(() => {
        performAutocompleteSearch(newQuery);
      }, autoSearchDelay);

      setDebounceTimer(timer);
    },
    [debounceTimer, autoSearchDelay, performAutocompleteSearch],
  );

  /*
    검색 및 결과 초기화 - x 버튼 클릭, 검색창 닫기
  */
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setIsLoading(false);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  }, [debounceTimer]);

  /* 
    컴포넌트 언마운트 시 타이머 정리
  */
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    // 상태
    query,
    isLoading,
    error,
    results,

    // 액션
    setQuery: handleQueryChange,
    clearSearch,

    // 유틸리티
    hasQuery: query.trim().length > 0,
    hasResults: results.length > 0,
  };
};
