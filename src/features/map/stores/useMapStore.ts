import React from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MapState {
  globalNavigation: any;
  setGlobalNavigation: (navigation: any) => void;

  isMapReady: boolean;
  setIsMapReady: (isReady: boolean) => void;
  mapReadyVersion: number;
  bumpMapReadyVersion: () => void;
}

export const useMapStore = create<MapState>()(
  devtools(
    set => ({
      globalNavigation: null,
      isMapReady: false,
      mapReadyVersion: 0,

      setIsMapReady: isReady =>
        set({ isMapReady: isReady }, false, 'map/setIsMapReady'),

      setGlobalNavigation: globalNavigation =>
        set({ globalNavigation }, false, 'map/setGlobalNavigation'),

      bumpMapReadyVersion: () =>
        set(
          state => ({ mapReadyVersion: state.mapReadyVersion + 1 }),
          false,
          'map/bumpMapReadyVersion',
        ),
    }),
    { name: 'MapStore' },
  ),
);
