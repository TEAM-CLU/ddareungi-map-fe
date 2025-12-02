import { Audio } from 'expo-av';
export interface NavDetailModalState {
  soundRef: React.RefObject<Audio.Sound | null> | null;
  systemVolume: number;
  setSystemVolume: (volume: number) => void;
  navVolume: number;
  setNavVolume: (volume: number) => void;

  setAllNavDetailModalItems: (
    modalRefs: Partial<
      Pick<
        NavDetailModalState,
        | 'soundRef'
        | 'systemVolume'
        | 'setSystemVolume'
        | 'navVolume'
        | 'setNavVolume'
      >
    >,
  ) => void;
}
