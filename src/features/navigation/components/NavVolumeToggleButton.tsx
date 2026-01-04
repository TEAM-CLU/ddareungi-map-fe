import { useVolumeStore } from '@/features/navigation/stores/useVolumeStore';
import { IconMute, IconVolume } from '@/shared/components/icons';
import { tw } from '@/shared/libs/tw-helper';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

const NavVolumeToggleButton = () => {
  const { systemVolume, setSystemVolume } = useVolumeStore(
    useShallow(state => ({
      systemVolume: state.systemVolume,
      setSystemVolume: state.setSystemVolume,
    })),
  );

  const [isMuted, setIsMuted] = useState(false);

  const handleVolumeTogglePress = () => {
    if (systemVolume === 0) setIsMuted(true);

    if (isMuted) {
      // 음소거 해제
      setIsMuted(false);
      setSystemVolume(0.5);
      return;
    }
    if (!isMuted) {
      // 음소거
      setIsMuted(true);
      setSystemVolume(0);
      return;
    }
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
      {isMuted ? <IconMute color="#77838F" /> : <IconVolume />}
    </TouchableOpacity>
  );
};
export default NavVolumeToggleButton;
