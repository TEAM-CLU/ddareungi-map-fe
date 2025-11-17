// src/shared/stores/useSearchStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AutocompleteResult } from '../model/search.types';

interface SearchState {
  selectedPlaceInfoForModal: AutocompleteResult | null;
  searchText: string;

  setSelectedPlaceInfoForModal: (place: AutocompleteResult | null) => void;
  setSearchText: (text: string) => void;
}

export const useSearchStore = create<SearchState>()(
  devtools(
    set => ({
      selectedPlaceInfoForModal: null,
      searchText: '',

      setSelectedPlaceInfoForModal: data =>
        set({ selectedPlaceInfoForModal: data }, false, 'search/setPlace'),

      setSearchText: text => set({ searchText: text }, false, 'search/setText'),
    }),
    { name: 'SearchStore' },
  ),
);
