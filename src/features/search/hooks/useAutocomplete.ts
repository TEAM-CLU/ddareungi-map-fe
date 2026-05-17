import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PlaceInfo, SearchOptions } from '../model/search.types';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { useInfinitePlaceSearch } from '../services/search.queries';

/** 검색 시작 시점의 GPS 좌표를 이 시간(ms) 동안 캐싱하여 불필요한 재요청 방지 */
const SEARCH_COORD_CACHE_DURATION_MS = 20_000;

export const useAutocomplete = () => {
  // 1. 입력값 상태 (UI 표시용 - 즉시 반응)
  const [query, setQuery] = useState('');

  // 2. 디바운스된 검색어 (API 요청용 - 0.3초 뒤 반응)
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const locationMetaData = useMyPositionStore(state => state.locationMetaData);
  const myPosition = locationMetaData?.coordinate;

  // ─────────────────────────────────────────────
  // GPS 좌표 캐싱
  // GPS 튐으로 인한 xy 변경 → 불필요한 재요청 방지
  // 검색 세션 시작 시점의 좌표를 20초간 고정 사용
  // ─────────────────────────────────────────────
  const [cachedSearchPosition, cachedSearchPositionSet] = useState<
    { lat: number; lng: number } | null
  >(null);
  const isSearchSessionActiveRef = useRef(false);
  const searchCacheTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const hasQuery = query.trim().length > 0;

    if (hasQuery && !isSearchSessionActiveRef.current) {
      // 검색 세션 시작: 현재 GPS 좌표 스냅샷 저장
      isSearchSessionActiveRef.current = true;
      cachedSearchPositionSet(myPosition ?? null);

      // 20초 후 캐시 만료 → 이후 live GPS 사용
      searchCacheTimerRef.current = setTimeout(() => {
        cachedSearchPositionSet(null);
      }, SEARCH_COORD_CACHE_DURATION_MS);
    } else if (!hasQuery && isSearchSessionActiveRef.current) {
      // 검색 세션 종료: 캐시 초기화
      isSearchSessionActiveRef.current = false;
      if (searchCacheTimerRef.current) {
        clearTimeout(searchCacheTimerRef.current);
        searchCacheTimerRef.current = null;
      }
      cachedSearchPositionSet(null);
    }
    // myPosition은 의도적으로 deps 제외 — 검색 시작 시점만 캡처
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    return () => {
      if (searchCacheTimerRef.current) clearTimeout(searchCacheTimerRef.current);
    };
  }, []);

  // 캐시가 유효하면 캐시된 좌표 사용, 만료 후엔 live GPS 사용
  const effectivePosition = cachedSearchPosition ?? myPosition;
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

    if (effectivePosition) {
      return {
        x: effectivePosition.lng, // 경도
        y: effectivePosition.lat, // 위도
        sort: 'accuracy', // 정확도순
        size: 15, // 한 번에 15개씩
      };
    }

    return { sort: 'accuracy', size: 15 };
  }, [debouncedQuery, effectivePosition]);

  // ----------------------------------------------------
  // [React Query 연동]
  // debouncedQuery가 바뀔 때만 실제로 API가 호출됨
  // ----------------------------------------------------
  const {
    data,
    isLoading: isQueryLoading,
    isFetching: isQueryFetching,
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

  // 기존 에러/결과가 없을 때만 전체 로딩 화면을 띄움
  // 기존 상태가 있을 땐 화면을 유지하고 isFetching으로만 알림 (깜빡임 방지)
  const isTyping = query !== debouncedQuery;
  const hasExistingState = results.length > 0 || !!queryError;
  const showLoading = !hasExistingState && (isTyping || isQueryLoading);
  const isFetching = hasExistingState && (isTyping || isQueryFetching);

  return {
    query,
    results,
    isLoading: showLoading,
    isFetching,
    isFetchingNextPage,
    error: queryError?.message || null,

    setQuery: handleQueryChange,
    clearSearch,
    fetchNextPage,

    hasQuery: query.trim().length > 0,
    hasResults: results.length > 0,
    hasNextPage,
  };
};
