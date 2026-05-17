import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  PlaceInfo,
  RecentSearchItem,
} from '@/features/search/model/search.types';
import {
  RECENT_SEARCH_KEY,
  MAX_RECENT_SEARCHE_COUNT,
} from '@/features/search/model/search.constants';

// [조회] AsyncStorage에서 최근 검색 기록 가져오기
export const getRecentSearches = async (): Promise<RecentSearchItem[]> => {
  const storedRecentSearchJson = await AsyncStorage.getItem(RECENT_SEARCH_KEY);

  if (!storedRecentSearchJson) return [];

  const parsedRecentSearchList: RecentSearchItem[] = JSON.parse(
    storedRecentSearchJson,
  );

  // 최신 검색 순으로 정렬 (timestamp 기준 내림차순)
  return parsedRecentSearchList.sort(
    (previousItem: RecentSearchItem, nextItem: RecentSearchItem) =>
      nextItem.timestamp - previousItem.timestamp,
  );
};

// [저장] 최근 검색 기록에 항목 추가 후 저장
export const saveRecentSearch = async (
  currentRecentSearchList: RecentSearchItem[],
  selectedPlace: PlaceInfo,
): Promise<RecentSearchItem[]> => {
  const newRecentSearchItem: RecentSearchItem = {
    placeId: selectedPlace.placeId,
    name: selectedPlace.name,
    address: selectedPlace.address,
    latitude: selectedPlace.latitude,
    longitude: selectedPlace.longitude,
    timestamp: Date.now(),
  };

  // 동일한 장소(placeId) 중복 제거
  const deduplicatedSearchList = currentRecentSearchList.filter(
    recentSearchItem => recentSearchItem.placeId !== selectedPlace.placeId,
  );

  // 최신 항목을 맨 앞에 추가하고 최대 개수 제한
  const updatedRecentSearchList = [
    newRecentSearchItem,
    ...deduplicatedSearchList,
  ].slice(0, MAX_RECENT_SEARCHE_COUNT);

  await AsyncStorage.setItem(
    RECENT_SEARCH_KEY,
    JSON.stringify(updatedRecentSearchList),
  );

  return updatedRecentSearchList;
};

// [삭제] 특정 최근 검색 기록 하나 삭제
export const removeRecentSearchItem = async (
  currentRecentSearchList: RecentSearchItem[],
  targetPlaceId: string,
): Promise<RecentSearchItem[]> => {
  const updatedRecentSearchList = currentRecentSearchList.filter(
    recentSearchItem => recentSearchItem.placeId !== targetPlaceId,
  );

  await AsyncStorage.setItem(
    RECENT_SEARCH_KEY,
    JSON.stringify(updatedRecentSearchList),
  );

  return updatedRecentSearchList;
};

// [전체 삭제] 최근 검색 기록 전체 제거
export const clearRecentSearchHistory = async (): Promise<
  RecentSearchItem[]
> => {
  await AsyncStorage.removeItem(RECENT_SEARCH_KEY);
  return [];
};
