import { BookmarkItem } from '../model/index.types';
import { AutocompleteResult } from '@/features/search/model/search.types';

export const createPlaceBookmark = (place: AutocompleteResult): BookmarkItem => {
    if (place.latitude == null || place.longitude == null) {
    throw new Error('장소의 좌표 정보가 없습니다.');
  }

  return {
    id: place.placeKey,
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    address: place.address,
    category: place.category || '기타',
    createdAt: Date.now(),
  }
};