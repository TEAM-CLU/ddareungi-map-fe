import { VolumeState } from '@/features/navigation/model/navigation.types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useVolumeStore = create<VolumeState>()(
  devtools(
    set => ({
      systemVolume: 0,
      setSystemVolume: (volume: number) =>
        set(
          { systemVolume: Math.min(1, Math.max(0, volume)) },
          false,
          'volumeStore/setSystemVolume',
        ),
    }),
    { name: 'volumeStore' },
  ),
);
