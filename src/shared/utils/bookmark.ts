import { BookmarkItem } from '../model/index.types';
import { AutocompleteResult } from '@/features/search/model/search.types';
import { MapAreaStationData } from '@/features/station/model/station.types';

// 장소 Bookmark 생성
export const createPlaceBookmark = (place: AutocompleteResult): BookmarkItem => {
    if (place.latitude == null || place.longitude == null) {
    throw new Error('장소의 좌표 정보가 없습니다.');
  }

  return {
    id: place.placeKey,
    type: 'place',
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    address: place.address,
    createdAt: Date.now(),
  }
};

// 대여소 Bookmark 생성
export const createStationBookmark = (station: MapAreaStationData): BookmarkItem => ({
  id: station.number,
  type: 'station',
  name: station.name,
  latitude: station.latitude,
  longitude: station.longitude,
  address: station.address ?? undefined,
  createdAt: Date.now(),
});