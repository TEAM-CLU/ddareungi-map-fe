import { useNavDetailModalStore } from '@/features/navigation/stores/useNavDetailModalStore';
import { IconMute, IconVolume } from '@/shared/components/icons';
import { tw } from '@/shared/libs/tw-helper';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

const NavVolumeToggleButton = () => {
  const { navVolume, setNavVolume } = useNavDetailModalStore(
    useShallow(state => ({
      systemVolume: state.systemVolume,
      setSystemVolume: state.setSystemVolume,
      navVolume: state.navVolume,
      setNavVolume: state.setNavVolume,
    })),
  );

  const [isMuted, setIsMuted] = useState(false);

  const handleVolumeToggleBtnPress = () => {
    if (navVolume === 0) setIsMuted(true);

    if (isMuted) {
      // 음소거 해제
      setIsMuted(false);
      setNavVolume(0.5);
      return;
    }
    if (!isMuted) {
      // 음소거
      setIsMuted(true);
      setNavVolume(0);
      return;
    }
  };
  return (
    <TouchableOpacity
      onPress={handleVolumeToggleBtnPress}
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
