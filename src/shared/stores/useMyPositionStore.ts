import { Coordinates } from '@/features/map/model/map.types';
import { LocationMetaData } from '@/features/navigation/model/navigation.types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MyPositionState {
  locationMetaData: LocationMetaData;
  setLocationMetaData: (locationMetaData: LocationMetaData) => void;
}

export const useMyPositionStore = (() => {
  return create<MyPositionState>()(
    devtools(set => ({
      locationMetaData: { timestamp: 0, coordinate: { lat: 0, lng: 0 } },
      setLocationMetaData: (locationMetaData: LocationMetaData) =>
        set({ locationMetaData }, false, 'myPosition/setLocationMetaData'),
    })),
  );
})();
