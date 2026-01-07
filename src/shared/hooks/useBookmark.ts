import { BookmarkItem, UseBookmarkOptions } from '../model/index.types';
import { useModalStore } from '../stores/useModalStore';
import { useBookmarkStore } from '../stores/useBookmarkStore';
import { useEffect, useState } from 'react';
import {
  UpdateBookmarksMessage,
} from '../model/map.webview.types';
import { WebViewMessageEvent } from 'react-native-webview';
import { useSearchStore } from '@/features/search/stores/useSearchStore';
import { useProvideWebviewMessenger } from './useProvideWebviewMessenger';
import { Alert } from 'react-native';
import { PlaceInfo } from '@/features/search/model/search.types';

export const useBookmark = ({ isMapReady }: UseBookmarkOptions) => {
  const { sendMessage } = useProvideWebviewMessenger();
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

      if (!clickedBookmark?.id || !clickedBookmark?.name || !clickedBookmark?.address || !clickedBookmark?.latitude || !clickedBookmark?.longitude) {
        console.error('유효하지 않은 즐겨찾기 데이터:', clickedBookmark);
        Alert.alert(
          '오류',
          '즐겨찾기 정보를 불러올 수 없습니다.',
        );
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
    } catch (error) {
      console.error('Bookmark Marker Click Error:', error);
      Alert.alert(
        '오류',
        '즐겨찾기 정보를 불러오는 중 오류가 발생했습니다.',
      );
    }
  };

  return {
    handleBookmarkMarkerClick,
  };
};
