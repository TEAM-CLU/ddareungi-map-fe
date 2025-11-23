// src/shared/stores/useStationStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  MapAreaStationData,
  NearbyStationData,
} from '@/features/station/model/station.types';

interface StationState {
  stationMetaData: MapAreaStationData | null;
  nearbyStationDataList: NearbyStationData[] | null;
  lamda: number;

  setStationMetaData: (data: MapAreaStationData | null) => void;
  setNearbyStationDataList: (list: NearbyStationData[] | null) => void;
  setLamda: (value: number) => void;
}

export const useStationStore = create<StationState>()(
  devtools(
    set => ({
      stationMetaData: null,
      nearbyStationDataList: null,
      lamda: 1.2,

      setStationMetaData: data =>
        set({ stationMetaData: data }, false, 'station/setMeta'),

      setNearbyStationDataList: list =>
        set({ nearbyStationDataList: list }, false, 'station/setNearby'),

      setLamda: value => set({ lamda: value }, false, 'station/setLamda'),
    }),
    { name: 'StationStore' },
  ),
);
