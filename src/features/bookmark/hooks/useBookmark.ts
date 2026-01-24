import { useModalStore } from '@/shared/stores/useModalStore';
import { useCallback, useEffect } from 'react';
import { WebViewMessageEvent } from 'react-native-webview';
import { useSearchStore } from '@/features/search/stores/useSearchStore';
import { Alert } from 'react-native';
import { PlaceInfo } from '@/features/search/model/search.types';
import { useBookmarkStore } from '@/features/bookmark/stores/useBookmarkStore';
import { BookmarkItem } from '@/features/bookmark/model/bookmark.types';
import { useBookmarkMessenger } from '@/features/bookmark/hooks/useBookmarkMessenger';

interface UseBookmarkParams {
  isMapReady: boolean;
  mapReadyVersion: number;
}
export const useBookmark = ({
  isMapReady,
  mapReadyVersion,
}: UseBookmarkParams) => {
  const { updateBookmarks } = useBookmarkMessenger();
  const { bookmarks } = useBookmarkStore();
  const { setSelectedPlaceInfoForModal } = useSearchStore();
  const { setShowPlaceDetailModal } = useModalStore();

  // 스토어 북마크 변경되면 웹뷰로 전송
  useEffect(() => {
    if (!isMapReady) return;
    updateBookmarks(bookmarks);
  }, [bookmarks, isMapReady, mapReadyVersion, updateBookmarks]);

  // 즐겨찾기 마커 클릭
  const handleBookmarkMarkerClick = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type !== 'clickBookmarkMarker') return;
        const clickedBookmark: BookmarkItem = data.bookmarkData;

        if (
          !clickedBookmark?.id ||
          !clickedBookmark?.name ||
          !clickedBookmark?.address ||
          !clickedBookmark?.latitude ||
          !clickedBookmark?.longitude
        ) {
          Alert.alert('오류', '즐겨찾기 정보를 불러올 수 없습니다.');
          return;
        }

        const bookmarkInfoForModal: PlaceInfo = {
          placeId: clickedBookmark.id,
          name: clickedBookmark.name,
          address: clickedBookmark.address,
          latitude: clickedBookmark.latitude,
          longitude: clickedBookmark.longitude,
          category: clickedBookmark.category,
        };
        setSelectedPlaceInfoForModal(bookmarkInfoForModal);
        setShowPlaceDetailModal(true);
      } catch (error) {}
    },
    [setSelectedPlaceInfoForModal, setShowPlaceDetailModal],
  );

  return {
    handleBookmarkMarkerClick,
  };
};
