// src/shared/stores/useMapStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import WebView from 'react-native-webview';

interface MapState {
  globalNavigation: any;
  setGlobalNavigation: (navigation: any) => void;

  isMapReady: boolean;
  setIsMapReady: (isReady: boolean) => void;
}

export const useMapStore = create<MapState>()(
  devtools(
    set => ({
      globalNavigation: null,
      isMapReady: false,

      setIsMapReady: isReady =>
        set({ isMapReady: isReady }, false, 'map/setIsMapReady'),

      setGlobalNavigation: globalNavigation =>
        set({ globalNavigation }, false, 'map/setGlobalNavigation'),
    }),
    { name: 'MapStore' },
  ),
);
