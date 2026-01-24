import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  PlaceInfo,
  RecentSearchItem,
} from '@/features/search/model/search.types';
import {
  RECENT_SEARCH_KEY,
  MAX_RECENT_SEARCHE_COUNT,
} from '@/features/search/model/search.constants';

// [조회] AsyncStorage에서 가져오기
export const getRecentSearches = async (): Promise<RecentSearchItem[]> => {
  const stored = await AsyncStorage.getItem(RECENT_SEARCH_KEY);
  if (!stored) return [];
  const parsed = JSON.parse(stored);
  // 최신순 정렬
  return parsed.sort(
    (a: RecentSearchItem, b: RecentSearchItem) => b.timestamp - a.timestamp,
  );
};

// [저장] 리스트에 추가하고 저장하기
export const saveRecentSearch = async (
  currentList: RecentSearchItem[],
  place: PlaceInfo,
): Promise<RecentSearchItem[]> => {
  const newItem: RecentSearchItem = {
    placeId: place.placeId,
    name: place.name,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    timestamp: Date.now(),
  };

  // 중복 제거 및 갯수 제한
  const filtered = currentList.filter(item => item.placeId !== place.placeId);
  const updated = [newItem, ...filtered].slice(0, MAX_RECENT_SEARCHE_COUNT);

  await AsyncStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(updated));
  return updated;
};

// [삭제] 하나 지우기
export const removeRecentSearchItem = async (
  currentList: RecentSearchItem[],
  id: string,
): Promise<RecentSearchItem[]> => {
  const updated = currentList.filter(item => item.placeId !== id);
  await AsyncStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(updated));
  return updated;
};

// [전체 삭제]
export const clearRecentSearchHistory = async (): Promise<
  RecentSearchItem[]
> => {
  await AsyncStorage.removeItem(RECENT_SEARCH_KEY);
  return [];
};
