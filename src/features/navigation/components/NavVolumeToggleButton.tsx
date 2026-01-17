import { useVolumeStore } from '@/features/navigation/stores/useVolumeStore';
import { IconMute, IconVolume } from '@/shared/components/icons';
import { tw } from '@/shared/libs/tw-helper';
import { useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { VolumeManager } from 'react-native-volume-manager';
import { useShallow } from 'zustand/react/shallow';

const NavVolumeToggleButton = () => {
  const { systemVolume, setSystemVolume } = useVolumeStore(
    useShallow(state => ({
      systemVolume: state.systemVolume,
      setSystemVolume: state.setSystemVolume,
    })),
  );

  const lastNonZeroVolumeRef = useRef(0.5);

  const applySystemVolume = async (volume: number) => {
    setSystemVolume(volume);
    if (VolumeManager && typeof VolumeManager.setVolume === 'function') {
      await VolumeManager.setVolume(volume);
    }
  };

  const handleVolumeTogglePress = async () => {
    if (systemVolume > 0) {
      lastNonZeroVolumeRef.current = systemVolume;
      await applySystemVolume(0);
      return;
    }

    const restoreVolume = Math.max(0.1, lastNonZeroVolumeRef.current || 0.5);
    await applySystemVolume(restoreVolume);
  };
  return (
    <TouchableOpacity
      onPress={handleVolumeTogglePress}
      style={[
        tw(
          'bg-icon-container-secondary rounded-full w-10 h-10 flex justify-center items-center shadow-md',
        ),
        { zIndex: 10 },
      ]}
    >
      {systemVolume === 0 ? <IconMute color="#77838F" /> : <IconVolume />}
    </TouchableOpacity>
  );
};
export default NavVolumeToggleButton;
