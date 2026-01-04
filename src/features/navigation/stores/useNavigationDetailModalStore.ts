import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface NavigationDetailModalState {
  totalIntervals: number;
  currentIntervalIndex: number;

  setTotalIntervals: (total: number) => void;
  setCurrentIntervalIndex: (index: number) => void;
}

export const useNavigationDetailModalStore =
  create<NavigationDetailModalState>()(
    devtools(
      set => ({
        totalIntervals: 0,
        currentIntervalIndex: 0,

        setTotalIntervals: (total: number) =>
          set(
            { totalIntervals: total },
            false,
            'navigationDetailModal/setTotalIntervals',
          ),
        setCurrentIntervalIndex: (index: number) =>
          set(
            { currentIntervalIndex: index },
            false,
            'navigationDetailModal/setCurrentIntervalIndex',
          ),
      }),
      { name: 'navigationDetailModal' },
    ),
  );
