import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AutocompleteResult } from './useAutocomplete';

const RECENT_SEARCH_KEY = '@ddareungi_recent_searches';
const MAX_RECENT_SEARCHES = 10;

export interface RecentSearchItem {
  id: string;
  name: string;
  address: string;
  timestamp: number;
  latitude?: number;
  longitude?: number;
}

export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 최근 검색 기록 불러오기
  const loadRecentSearches = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(RECENT_SEARCH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 시간순으로 정렬 (최신순)
        const sorted = parsed.sort((a: RecentSearchItem, b: RecentSearchItem) => 
          b.timestamp - a.timestamp
        );
        setRecentSearches(sorted);
      }
    } catch (error) {
      console.error('최근 검색 기록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 검색 기록 저장
  const addRecentSearch = useCallback(async (place: AutocompleteResult) => {
    try {
      const newItem: RecentSearchItem = {
        id: place.id,
        name: place.name,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        timestamp: Date.now(),
      };

      setRecentSearches(prev => {
        // 중복 제거 (같은 장소는 최신 검색으로 업데이트)
        const filtered = prev.filter(item => item.id !== place.id);
        
        // 새 항목 추가하고 최대 개수 제한
        const updated = [newItem, ...filtered].slice(0, MAX_RECENT_SEARCHES);
        
        // AsyncStorage에 저장
        AsyncStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(updated));
        
        return updated;
      });
    } catch (error) {
      console.error('최근 검색 기록 저장 실패:', error);
    }
  }, []);

  // 특정 검색 기록 삭제
  const removeRecentSearch = useCallback(async (id: string) => {
    try {
      setRecentSearches(prev => {
        const updated = prev.filter(item => item.id !== id);
        AsyncStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('검색 기록 삭제 실패:', error);
    }
  }, []);

  // 모든 검색 기록 삭제
  const clearRecentSearches = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCH_KEY);
      setRecentSearches([]);
    } catch (error) {
      console.error('검색 기록 전체 삭제 실패:', error);
    }
  }, []);

  // 컴포넌트 마운트 시 검색 기록 로드
  useEffect(() => {
    loadRecentSearches();
  }, [loadRecentSearches]);

  return {
    recentSearches,
    isLoading,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    refreshRecentSearches: loadRecentSearches,
  };
};