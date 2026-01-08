import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BookmarkItem } from '../../../shared/model/index.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAX_BOOKMARK_COUNT } from '../model/bookmark.constants';

export type toggleBookmarkResult =
  | 'added'
  | 'removed'
  | 'limit_reached'
  | 'fail';

interface BookmarkState {
  bookmarks: BookmarkItem[];

  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  toggleBookmark: (bookmark: BookmarkItem) => toggleBookmarkResult;
  addBookmark: (bookmark: BookmarkItem) => boolean;
  removeBookmark: (id: string) => void;
  updateBookmarkAlias: (id: string, alias: string) => void;
  updateBookmarkColor: (id: string, color: string) => void;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      toggleBookmark: (bookmark: BookmarkItem) => {
        const { bookmarks, addBookmark, removeBookmark } = get();
        const exists = bookmarks.some(item => item.id === bookmark.id);

        if (exists) {
          removeBookmark(bookmark.id);
          return 'removed';
        } else {
          const isAdded = addBookmark(bookmark);
          return isAdded ? 'added' : 'limit_reached';
        }
      },

      addBookmark: (bookmark: BookmarkItem) => {
        const list = get().bookmarks;

        // 중복 방어 로직 (이미 있으면 무시)
        if (list.some(item => item.id === bookmark.id)) return false;

        // 개수 제한 체크
        if (list.length >= MAX_BOOKMARK_COUNT) {
          return false;
        }

        const newBookmark = {
          ...bookmark,
          alias: bookmark.alias || bookmark.name,
          color: bookmark.color || '#01DA86',
          createdAt: Date.now(),
        };

        set(state => ({ bookmarks: [...state.bookmarks, newBookmark] }));
        return true;
      },

      removeBookmark: (id: string) => {
        set(state => ({
          bookmarks: state.bookmarks.filter(item => item.id !== id),
        }));
      },

      updateBookmarkAlias: (id, alias) => {
        set(state => ({
          bookmarks: state.bookmarks.map(b =>
            b.id === id ? { ...b, alias } : b,
          ),
        }));
      },

      updateBookmarkColor: (id, color) => {
        set(state => ({
          bookmarks: state.bookmarks.map(b =>
            b.id === id ? { ...b, color } : b,
          ),
        }));
      },
    }),
    {
      name: 'bookmark-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1, // 데이터 구조 변경 대비
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('즐겨찾기 데이터 로드 실패:', error);
        state?.setHasHydrated(true);
      },
    },
  ),
);
