import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TextInput } from 'react-native';
import { PlaceInfo } from '../model/search.types';

interface SearchState {
  selectedPlaceInfoForModal: PlaceInfo | null;
  searchText: string;
  showSearchOverlay: boolean;
  isFocused: boolean;
  searchInputRef: React.RefObject<TextInput | null> | null;
  setShowSearchOverlay: (show: boolean) => void;
  setSelectedPlaceInfoForModal: (place: PlaceInfo | null) => void;
  setSearchText: (text: string) => void;
  setIsFocused: (focused: boolean) => void;
  setSearchInputRef: (ref: React.RefObject<TextInput | null> | null) => void;
}

export const useSearchStore = create<SearchState>()(
  devtools(
    set => ({
      selectedPlaceInfoForModal: null,
      searchText: '',
      showSearchOverlay: false,
      isFocused: false,
      searchInputRef: null,

      setSelectedPlaceInfoForModal: data =>
        set({ selectedPlaceInfoForModal: data }, false, 'search/setPlace'),

      setShowSearchOverlay: (show: boolean) =>
        set({ showSearchOverlay: show }, false, 'setShowSearchOverlay'),

      setSearchText: text => set({ searchText: text }, false, 'search/setText'),

      setIsFocused: focused =>
        set({ isFocused: focused }, false, 'search/setIsFocused'),

      setSearchInputRef: ref =>
        set({ searchInputRef: ref }, false, 'search/setInputRef'),
    }),
    { name: 'SearchStore' },
  ),
);
