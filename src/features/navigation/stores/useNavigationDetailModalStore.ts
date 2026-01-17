import { NavigationInstruction } from '@/features/navigation/model/navigation.types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface NavigationDetailModalState {
  instructionList: NavigationInstruction[];
  currentIntervalIndex: number;

  setInstructionList: (list: NavigationInstruction[]) => void;
  setCurrentIntervalIndex: (index: number) => void;
}

export const useNavigationDetailModalStore =
  create<NavigationDetailModalState>()(
    devtools(
      set => ({
        instructionList: [],
        currentIntervalIndex: 0,

        setInstructionList: (list: NavigationInstruction[]) =>
          set(
            { instructionList: list },
            false,
            'navigationDetailModal/setInstructionList',
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
