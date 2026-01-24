import { LocationMode } from '@/features/location/model/location.types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
interface LocationState {
  locationMode: LocationMode;
  setLocationMode: (mode: LocationMode) => void;
}

export const useLocationStore = create<LocationState>()(
  devtools(
    set => ({
      locationMode: 'default',
      setLocationMode: locationMode =>
        set({ locationMode }, false, 'location/setLocationMode'),
    }),
    { name: 'LocationStore' },
  ),
);
