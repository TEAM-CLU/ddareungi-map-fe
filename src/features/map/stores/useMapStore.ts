// src/shared/stores/useMapStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import WebView from 'react-native-webview';

interface MapState {
  webRef: React.RefObject<WebView | null>;
  globalNavigation: any;

  setWebRef: (ref: React.RefObject<WebView | null>) => void;
  setGlobalNavigation: (navigation: any) => void;
}

export const useMapStore = create<MapState>()(
  devtools(
    set => ({
      webRef: null,
      navigation: null,

      setWebRef: ref => set({ webRef: ref }, false, 'map/setWebRef'),

      setGlobalNavigation: navigation =>
        set({ globalNavigation: navigation }, false, 'map/setGlobalNavigation'),
    }),
    { name: 'MapStore' },
  ),
);
