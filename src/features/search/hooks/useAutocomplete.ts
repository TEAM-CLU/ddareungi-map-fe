import { useCallback, useEffect, useMemo, useState } from 'react';
import { PlaceInfo, SearchOptions } from '../model/search.types';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { useInfinitePlaceSearch } from '../services/search.queries';

export const useAutocomplete = () => {
  // 1. 입력값 상태 (UI 표시용 - 즉시 반응)
  const [query, setQuery] = useState('');

  // 2. 디바운스된 검색어 (API 요청용 - 0.3초 뒤 반응)
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const locationMetaData = useMyPositionStore(state => state.locationMetaData);
  const myPosition = locationMetaData?.coordinate;
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
  // ----------------------------------------------------
  const searchOptions: SearchOptions = useMemo(() => {
    // 검색어가 너무 짧으면 API 요청 안 함
    if (!debouncedQuery.trim()) return {};

    if (myPosition) {
      return {
        x: myPosition.lng, // 경도
        y: myPosition.lat, // 위도
        sort: 'accuracy', // 정확도순
        size: 15, // 한 번에 15개씩
      };
    }

    return { sort: 'accuracy', size: 15 };
  }, [debouncedQuery, myPosition]);

  // ----------------------------------------------------
  // [React Query 연동]
  // debouncedQuery가 바뀔 때만 실제로 API가 호출됨
  // ----------------------------------------------------
  const {
    data,
    isLoading: isQueryLoading,
    isError,
    error: queryError,
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

  // 타이핑 중(디바운스 대기)이거나, API 로딩 중이면 '로딩 중'으로 취급
  // 단, 이전 에러/결과가 이미 있을 때는 타이핑만으로 로딩 화면으로 전환하지 않음 (깜빡임 방지)
  const isTyping = query !== debouncedQuery;
  const hasExistingState = results.length > 0 || !!queryError;
  const showLoading = isQueryLoading || (isTyping && !hasExistingState);

  return {
    query,
    results,
    isLoading: showLoading,
    isFetchingNextPage,
    error: queryError?.message || null, // 인터셉터가 가공한 메시지

    setQuery: handleQueryChange,
    clearSearch,
    fetchNextPage,

    hasQuery: query.trim().length > 0,
    hasResults: results.length > 0,
    hasNextPage,
  };
};
