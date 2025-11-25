import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Bookmark } from '../model/index.types';

interface BookmarkState {
  bookmarks: Bookmark[];
  toggleBookmark: (bookmark: Bookmark) => void;
  isBookmarked: (type: Bookmark['type'], id: string) => boolean;
  updateAlias: (type: Bookmark['type'], id: string, alias: string) => void;
  updateColor: (type: Bookmark['type'], id: string, color: string) => void;
  getByType: (type: Bookmark['type']) => Bookmark[]; // 타입별 리스트 조회
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      toggleBookmark: (bookmark: Bookmark) => {
        const list = get().bookmarks;
        const exists = list.find(
          item => item.type === bookmark.type && item.id === bookmark.id,
        );

        if (exists) {
          const updated = list.filter(
            item => !(item.type === bookmark.type && item.id === bookmark.id),
          );
          set({ bookmarks: updated });
        }

        const checkLimit =
          list.filter(item => item.type === bookmark.type).length >= 5;
        if (checkLimit) {
          console.warn(
            `${bookmark.type} 즐겨찾기 최대 개수(5개)를 초과했습니다.`,
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

      isBookmarked: (type, id) => {
        return get().bookmarks.some(b => b.type === type && b.id === id);
      },

      updateAlias: (type, id, alias) => {
        const updated = get().bookmarks.map(b =>
          b.type === type && b.id === id ? { ...b, alias } : b,
        );
        return set({ bookmarks: updated });
      },

      updateColor: (type, id, color) => {
        const updated = get().bookmarks.map(b =>
          b.type === type && b.id === id ? { ...b, color } : b,
        );
        return set({ bookmarks: updated });
      },

      getByType: type => {
        return get()
          .bookmarks.filter(b => b.type === type)
          .sort((a, b) => b.createdAt - a.createdAt);
      },
    }),
    {
      name: 'bookmark-storage',
    },
  ),
);
