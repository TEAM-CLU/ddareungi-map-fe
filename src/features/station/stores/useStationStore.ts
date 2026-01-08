import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { MapAreaStationData } from '@/features/station/model/station.types';

interface StationState {
  stationMetaData: MapAreaStationData | null;
  setStationMetaData: (data: MapAreaStationData | null) => void;
}

export const useStationStore = create<StationState>()(
  devtools(
    set => ({
      stationMetaData: null,

      setStationMetaData: data =>
        set({ stationMetaData: data }, false, 'station/setMeta'),
    }),
    { name: 'StationStore' },
  ),
);
