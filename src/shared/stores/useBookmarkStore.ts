import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BookmarkItem } from '../model/index.types';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BookmarkState {
  bookmarks: BookmarkItem[];
  toggleBookmark: (bookmark: BookmarkItem) => void;
  isBookmarked: (id: string) => boolean;
  updateAlias: (id: string, alias: string) => void;
  updateColor: (id: string, color: string) => void;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      toggleBookmark: (bookmark: BookmarkItem) => {
        const list = get().bookmarks;
        const exists = list.find(
          item => item.id === bookmark.id,
        );

        if (exists) {
          const updated = list.filter(
            item => !(item.id === bookmark.id),
          );
          set({ bookmarks: updated });
          return;
        }

        const checkLimit =
          list.length >= 10;
        if (checkLimit) {
          console.warn(
            `즐겨찾기 최대 개수(10개)를 초과했습니다.`,
          );
          Alert.alert(
            '즐겨찾기 최대 개수 초과',
            '즐겨찾기는 최대 10개까지 등록할 수 있습니다.',
          );
          return;
        }

        const updated = [
          ...list,
          {
            ...bookmark,
            createdAt: Date.now(),
          },
        ];
        set({ bookmarks: updated });
      },

      isBookmarked: (id) => {
        return get().bookmarks.some(b => b.id === id);
      },

      updateAlias: (id, alias) => {
        const updated = get().bookmarks.map(b =>
          b.id === id ? { ...b, alias } : b,
        );
        return set({ bookmarks: updated });
      },

      updateColor: (id, color) => {
        const updated = get().bookmarks.map(b =>
          b.id === id ? { ...b, color } : b,
        );
        return set({ bookmarks: updated });
      },
    }),
    {
      name: 'bookmark-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
