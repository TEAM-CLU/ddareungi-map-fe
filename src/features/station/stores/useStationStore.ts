import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { MapAreaStationData } from '@/features/station/model/station.types';

interface StationState {
  isStationMarkersVisible: boolean;
  stationMetaData: MapAreaStationData | null;
  setStationMarkersVisible: (isVisible: boolean) => void;
  setStationMetaData: (data: MapAreaStationData | null) => void;
}

export const useStationStore = create<StationState>()(
  devtools(
    set => ({
      isStationMarkersVisible: true,
      stationMetaData: null,

      setStationMarkersVisible: isVisible =>
        set(
          { isStationMarkersVisible: isVisible },
          false,
          'station/setMarkersVisible',
        ),

      setStationMetaData: data =>
        set({ stationMetaData: data }, false, 'station/setMeta'),
    }),
    { name: 'StationStore' },
  ),
);
