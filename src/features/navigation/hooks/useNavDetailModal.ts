import { useNavDetailModalStore } from '@/features/navigation/stores/useNavDetailModalStore';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';

export const useNavDetailModal = () => {
  const { setAllNavDetailModalItems } = useNavDetailModalStore();

  const soundLocalRef = useRef<Audio.Sound | null>(null);
  const [systemLocalVolume, setSystemLocalVolume] = useState<number>(0.5);
  const [navLocalVolume, setNavLocalVolume] = useState<number>(0.5);

  useEffect(() => {
    setAllNavDetailModalItems({
      soundRef: soundLocalRef,
      systemVolume: systemLocalVolume,
      setSystemVolume: setSystemLocalVolume,
      navVolume: navLocalVolume,
      setNavVolume: setNavLocalVolume,
    });
  }, [
    soundLocalRef,
    systemLocalVolume,
    setSystemLocalVolume,
    navLocalVolume,
    setNavLocalVolume,
  ]);
};
