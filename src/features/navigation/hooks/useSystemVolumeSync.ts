import { useEffect } from 'react';
import { VolumeManager } from 'react-native-volume-manager';

export const useSystemVolumeSync = (setSystemVolume: (v: number) => void) => {
  // 시스템 볼륨 초기값 설정 및 리스너 등록
  useEffect(() => {
    const canUseVolumeManager =
      VolumeManager &&
      typeof VolumeManager.getVolume === 'function' &&
      typeof VolumeManager.addVolumeListener === 'function';

    if (!canUseVolumeManager) {
      return;
    }

    try {
      VolumeManager.getVolume().then(volumeData =>
        setSystemVolume(volumeData.volume),
      );
    } catch (error) {}

    const volumeListener = VolumeManager.addVolumeListener(
      (volumeData: { volume: number }) => {
        setSystemVolume(volumeData.volume);
      },
    );

    return () => {
      volumeListener.remove();
    };
  }, []);
};
