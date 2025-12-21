import { useCallback, useEffect, useMemo, useState } from 'react';
import { PlaceInfo, SearchOptions } from '../model/search.types';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { useInfinitePlaceSearch } from '../services/search.queries';

export const useAutocomplete = () => {
  // 1. 입력값 상태 (UI 표시용 - 즉시 반응)
  const [query, setQuery] = useState('');

  // 2. 디바운스된 검색어 (API 요청용 - 0.3초 뒤 반응)
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { myPosition } = useMyPositionStore();

  // ----------------------------------------------------
  // [디바운싱 로직]
  // 사용자가 타자를 칠 때는 query만 바뀌고,
  // 입력이 멈추면 일정 시간 뒤에 debouncedQuery가 바뀜
  // ----------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // ----------------------------------------------------
  // [쿼리 옵션 계산]
  // 위치가 있으면 거리순, 없으면 정확도순
  // ----------------------------------------------------
  const searchOptions: SearchOptions = useMemo(() => {
    // 검색어가 너무 짧으면 API 요청 안 함
    if (debouncedQuery.trim().length < 1) {
      return {}; 
    }

    return myPosition
      ? {
          x: myPosition.lng,
          y: myPosition.lat,
          radius: 10000, // 10km
          sort: 'distance',
          size: 15, // 자동완성 15개
        }
      : {
          sort: 'accuracy',
          size: 15,
        };
  }, [debouncedQuery, myPosition]);

  // ----------------------------------------------------
  // [React Query 연동]
  // debouncedQuery가 바뀔 때만 실제로 API가 호출됨
  // ----------------------------------------------------
  const {
    data,
    isLoading: isQueryLoading, // 로딩 상태
    isError,
    error: queryError,         // 에러 객체 (메시지 포함)
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePlaceSearch(debouncedQuery, searchOptions);
  
// ----------------------------------------------------
  // [결과 데이터 가공]
  // 쿼리 데이터(pages)를 하나의 배열로 평탄화
  // ----------------------------------------------------
  const results: PlaceInfo[] = useMemo(() => {
    if (!data) return [];
    return data.pages.flat();
  }, [data]);

  // ----------------------------------------------------
  // [액션 핸들러]
  // ----------------------------------------------------
  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    // 상태
    query,
    results,
    isLoading: isQueryLoading,
    error: isError ? queryError?.message: null,

    // 액션
    setQuery: handleQueryChange,
    clearSearch,

    // 유틸리티
    hasQuery: query.trim().length > 0,
    hasResults: results.length > 0,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
