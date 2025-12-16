import { useMapWebview } from '@/features/map/hooks/useMapWebview';
import { useCallback } from 'react';
import { FocusOnBookmarkMessage, UpdateBookmarksMessage } from '@/shared/model/map.webview.types';
import { BookmarkItem } from '@/shared/model/index.types';

/**
 * 즐겨찾기 관련 WebView 통신 훅
 */
export const useBookmarkMessenger = () => {
  const { sendMessage } = useMapWebview();

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

  return {
    sendBookmarks,
    focusOnBookmark,
  };
};
