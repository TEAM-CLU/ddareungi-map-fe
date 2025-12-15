import { useMapWebview } from '@/features/map/hooks/useMapWebview';
import { BookmarkItem, UseBookmarkOptions } from '../model/index.types';
import { useModalStore } from '../stores/useModalStore';
import { useMapStore } from '@/features/map/stores/useMapStore';
import { useBookmarkStore } from '../stores/useBookmarkStore';
import { useEffect, useState } from 'react';
import {
  UpdateBookmarksMessage,
  WebViewMessageToRN,
} from '../model/map.webview.types';
import { WebViewMessageEvent } from 'react-native-webview';
import { useSearchStore } from '@/features/search/stores/useSearchStore';
import { AutocompleteResult } from '@/features/search/model/search.types';

export const useBookmark = ({ isMapReady }: UseBookmarkOptions) => {
  const { sendMessage } = useMapWebview();
  const { bookmarks } = useBookmarkStore();
  const { setSelectedPlaceInfoForModal } = useSearchStore();
  const { setShowPlaceDetailModal } = useModalStore();

  // 스토어 북마크 변경되면 웹뷰로 전송
  useEffect(() => {
    if (!isMapReady) return;

    const message: UpdateBookmarksMessage = {
      type: 'updateBookmarks',
      bookmarks: bookmarks,
    };
    sendMessage(message);
  }, [bookmarks, isMapReady, sendMessage]);

  // 즐겨찾기 마커 클릭
  const handleBookmarkMarkerClick = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type !== 'clickBookmarkMarker') return;
      const clickedBookmark: BookmarkItem = data.bookmarkData;
      const bookmarkInfoForModal: AutocompleteResult = {
        placeKey: clickedBookmark.id,
        name: clickedBookmark.name,
        address: clickedBookmark.address,
        latitude: clickedBookmark.latitude,
        longitude: clickedBookmark.longitude,
        category: clickedBookmark.category,
      };
      setSelectedPlaceInfoForModal(bookmarkInfoForModal);
      setShowPlaceDetailModal(true);
    } catch (error) {
      console.error('Bookmark Marker Click Error:', error);
    }
  };

  return {
    handleBookmarkMarkerClick,
  };
};
