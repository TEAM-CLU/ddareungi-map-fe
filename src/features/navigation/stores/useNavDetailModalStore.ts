import { NavDetailModalState } from '@/features/navigation/model/navigation.types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useNavDetailModalStore = create<NavDetailModalState>()(
  devtools(
    set => ({
      soundRef: null,
      systemVolume: 0,
      setSystemVolume: (volume: number) =>
        set({ systemVolume: volume }, false, 'navDetailModal/setSystemVolume'),
      navVolume: 0,
      setNavVolume: (volume: number) =>
        set({ navVolume: volume }, false, 'navDetailModal/setNavVolume'),

      setAllNavDetailModalItems: modalRefs =>
        set(
          currentState => ({ ...currentState, ...modalRefs }),
          false,
          'navDetailModal/setAllNavDetailModalItems',
        ),
    }),
    { name: 'navDetailModal' },
  ),
);
