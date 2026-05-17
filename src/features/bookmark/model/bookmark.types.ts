export interface BookmarkItem {
  id: string; // placeId
  name: string; // 장소명
  alias?: string; // 별칭
  color?: string; // 마커/뱃지 색상

  address: string;
  category: string;
  latitude: number;
  longitude: number;

  createdAt: number; // 정렬용
}

export type ToggleBookmarkResult =
  | 'added'
  | 'removed'
  | 'limit_reached'
  | 'fail';
