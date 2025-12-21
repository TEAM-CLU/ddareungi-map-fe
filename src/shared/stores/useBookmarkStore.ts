import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BookmarkItem } from '../model/index.types';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BookmarkState {
  bookmarks: BookmarkItem[];

  // 데이터 로드 상태 체크용 (내부 데이터)
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  toggleBookmark: (bookmark: BookmarkItem) => void;
  addBookmark: (bookmark: BookmarkItem) => void;
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
        } else {
          addBookmark(bookmark);
        }
      },

      addBookmark: (bookmark: BookmarkItem) => {
        const list = get().bookmarks;

        // 중복 방어 로직 (이미 있으면 무시)
        if (list.some(item => item.id === bookmark.id)) return;

        // 개수 제한 체크
        if (list.length >= 10) {
          console.warn(`즐겨찾기 최대 개수(10개)를 초과했습니다.`);
          Alert.alert(
            '즐겨찾기 최대 개수 초과',
            '즐겨찾기는 최대 10개까지 등록할 수 있습니다.',
          );
          return;
        }

        const newBookmark = {
          ...bookmark,
          alias: bookmark.alias || bookmark.name,
          color: bookmark.color || '#01DA86',
          createdAt: Date.now(),
        };

        set(state => ({ bookmarks: [...state.bookmarks, newBookmark] }));
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
        if (error) {
          console.error('즐겨찾기 데이터 로드 실패:', error);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
