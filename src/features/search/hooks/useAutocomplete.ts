import { useCallback, useEffect, useState } from 'react';
import { searchPlacesByKeyword } from '../services/search.api';
import { SearchOptions } from '../model/search.types';
import { SEARCH_CONSTANTS } from '../model/search.constants';

// 자동완성 검색 결과 타입
export interface AutocompleteResult {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  distance?: string;
  category?: string;
}

interface UseAutocompleteOptions {
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  autoSearchDelay?: number;
}

export const useAutocomplete = (options: UseAutocompleteOptions = {}) => {
  const {
    currentLocation,
    autoSearchDelay = SEARCH_CONSTANTS.DEFAULT_DEBOUNCE_DELAY,
  } = options;

  const [query, setQuery] = useState(''); // 현재 입력된 검색어
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AutocompleteResult[]>([]); // 검색 결과 리스트
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null); // 디바운스 타이머

  // 자동완성 검색 실행
  const performAutocompleteSearch = useCallback(
    async (searchQuery: string) => {
      const trimmedQuery = searchQuery.trim();

      // 최소 길이 검증
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
        const searchOptions: SearchOptions = currentLocation
          ? {
              x: currentLocation.longitude,
              y: currentLocation.latitude,
              radius: SEARCH_CONSTANTS.DEFAULT_SEARCH_RADIUS,
              sort: SEARCH_CONSTANTS.SORT_OPTIONS.DISTANCE,
            }
          : {
              sort: SEARCH_CONSTANTS.SORT_OPTIONS.ACCURACY,
            };

        const searchResults = await searchPlacesByKeyword(
          searchQuery,
          searchOptions,
        );

        // PlaceInfo를 AutocompleteResult로 변환
        const autocompleteResults: AutocompleteResult[] = searchResults.map(
          place => ({
            id: place.id,
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
    [currentLocation],
  );

  // 검색어 변경 처리 - 사용자 입력마다 API 호출 방지
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      setError(null); // 새 검색 시 에러 초기화

      // 기존 타이머 정리
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // 검색어가 비어있으면 즉시 결과 초기화
      if (!newQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      // 타이핑이 시작되면 즉시 로딩 상태로 변경
      setIsLoading(true);

      // 새 타이머 설정
      const timer = setTimeout(() => {
        performAutocompleteSearch(newQuery); // 일정 시간 뒤 API 호출
      }, autoSearchDelay);

      setDebounceTimer(timer);
    },
    [debounceTimer, autoSearchDelay, performAutocompleteSearch],
  );

  // 검색 및 결과 초기화 - x 버튼 클릭, 검색창 닫기
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  }, [debounceTimer]);

  // 컴포넌트 언마운트 시 타이머 정리
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
