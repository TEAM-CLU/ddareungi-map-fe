import { Coordinates } from '@/features/map/model/map.types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MyPositionState {
  myPosition: Coordinates | undefined;
  setMyPosition: (position: Coordinates) => void;
}

export const useMyPositionStore = (() => {
  return create<MyPositionState>()(
    devtools(set => ({
      myPosition: undefined,
      setMyPosition: (position: Coordinates) =>
        set({ myPosition: position }, false, 'myPosition/setMyPosition'),
    })),
  );
})();
