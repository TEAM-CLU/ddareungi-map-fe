import { useCallback } from 'react';
import {
  FocusOnBookmarkMessage,
  ShowSingleBookmarkMarkerMessage,
  ToggleBookmarkMarkersMessage,
  UpdateBookmarksMessage,
} from '@/shared/model/map.webview.types';
import { BookmarkItem } from '@/shared/model/index.types';
import { useProvideWebviewMessenger } from './useProvideWebviewMessenger';

/**
 * 즐겨찾기 관련 WebView 통신 훅
 */
export const useBookmarkMessenger = () => {
  const { sendMessage } = useProvideWebviewMessenger();

  // 마커 표시 On/off
  const turnOnBookmarkMarkers = useCallback(() => {
    const message: ToggleBookmarkMarkersMessage = {
      type: 'toggleBookmarkMarkers',
      isVisible: true,
    };
    sendMessage(message);
  }, [sendMessage]);

  const turnOffBookmarkMarkers = useCallback(() => {
    const message: ToggleBookmarkMarkersMessage = {
      type: 'toggleBookmarkMarkers',
      isVisible: false,
    };
    sendMessage(message);
  }, [sendMessage]);

  /**
   * 즐겨찾기 목록을 웹뷰로 전송
   */
  const sendBookmarks = useCallback(
    (bookmarks: BookmarkItem[]) => {
      const message: UpdateBookmarksMessage = {
        type: 'updateBookmarks',
        bookmarks,
      };
      sendMessage(message);
    },
    [sendMessage],
  );

  const focusOnBookmark = useCallback(
    (bookmarkId: string) => {
      const message: FocusOnBookmarkMessage = {
        type: 'focusOnBookmark',
        bookmarkId,
      };
      sendMessage(message);
    },
    [sendMessage],
  );

  /**
   * 단일 즐겨찾기 마커 표시 (토글 상태와 무관)
   */
  const showSingleBookmarkMarker = useCallback(
    (bookmark: BookmarkItem) => {
      const message: ShowSingleBookmarkMarkerMessage = {
        type: 'showSingleBookmarkMarker',
        bookmarkData: bookmark,
      };
      sendMessage(message);
    },
    [sendMessage],
  );

  return {
    sendBookmarks,
    focusOnBookmark,
    showSingleBookmarkMarker,
    turnOffBookmarkMarkers,
    turnOnBookmarkMarkers,
  };
};
