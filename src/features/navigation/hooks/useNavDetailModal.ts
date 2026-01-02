import { useNavDetailModalStore } from '@/features/navigation/stores/useNavDetailModalStore';
import { useEffect, useRef, useState } from 'react';

export const useNavDetailModal = () => {
  const setAllNavDetailModalItems = useNavDetailModalStore(
    state => state.setAllNavDetailModalItems,
  );

  const [systemLocalVolume, setSystemLocalVolume] = useState<number>(0.5);
  const [navLocalVolume, setNavLocalVolume] = useState<number>(0.5);

  useEffect(() => {
    setAllNavDetailModalItems({
      systemVolume: systemLocalVolume,
      setSystemVolume: setSystemLocalVolume,
      navVolume: navLocalVolume,
      setNavVolume: setNavLocalVolume,
    });
  }, [
    systemLocalVolume,
    setSystemLocalVolume,
    navLocalVolume,
    setNavLocalVolume,
  ]);
};
