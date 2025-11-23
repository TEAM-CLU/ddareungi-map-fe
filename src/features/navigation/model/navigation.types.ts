import { Audio } from 'expo-av';

export interface NavDetailModalState {
  soundRef: React.RefObject<Audio.Sound | null>;
  systemVolume: number;
  setSystemVolume: React.Dispatch<React.SetStateAction<number>>;
  navVolume: number;
  setNavVolume: React.Dispatch<React.SetStateAction<number>>;

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
