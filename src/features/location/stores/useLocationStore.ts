import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface LocationState {
  locationMode: 'default' | 'following' | 'compass';
  setLocationMode: (mode: 'default' | 'following' | 'compass') => void;
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
