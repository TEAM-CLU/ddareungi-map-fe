import { BookmarkItem } from '@/features/bookmark/model/bookmark.types';
import { PlaceInfo } from '@/features/search/model/search.types';

export const createPlaceBookmark = (place: PlaceInfo): BookmarkItem => {
  if (place.latitude == null || place.longitude == null) {
    throw new Error('장소의 좌표 정보가 없습니다.');
  }

  if (!place.placeId || !place.name) {
    throw new Error('장소의 필수 정보가 없습니다.');
  }

  return {
    id: place.placeId,
    name: place.name,
    alias: place.name,
    color: '#04C75B',
    latitude: place.latitude,
    longitude: place.longitude,
    address: place.address,
    category: place.category || '기타',
    createdAt: Date.now(),
  };
};
