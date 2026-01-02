// import { useNavDetailModalStore } from '@/features/navigation/stores/useNavDetailModalStore';
// import { IconMute, IconVolume } from '@/shared/components/icons';
// import { tw } from '@/shared/libs/tw-helper';
// import { useState } from 'react';
// import { TouchableOpacity } from 'react-native';

// interface NavVolumeToggleButtonProps {
// }
// const NavVolumeToggleButton = ({ soundRef }: NavVolumeToggleButtonProps) => {
//   const navVolume = useNavDetailModalStore(state => state.navVolume);

//   const [isMuted, setIsMuted] = useState(false);

//   const handleVolumeToggleBtnPress = () => {
//     if (isMuted) {
//       // 음소거 해제
//       setIsMuted(false);
//       if (!soundRef?.current) return;
//       soundRef.current.setVolume(navVolume);

//       return;
//     }
//     if (!isMuted) {
//       // 음소거
//       setIsMuted(true);
//       if (!soundRef?.current) return;
//       soundRef.current.setVolume(0);
//       return;
//     }
//   };
//   return (
//     <TouchableOpacity
//       onPress={handleVolumeToggleBtnPress}
//       style={[
//         tw(
//           'bg-icon-container-secondary rounded-full w-10 h-10 flex justify-center items-center shadow-md',
//         ),
//         { zIndex: 10 },
//       ]}
//     >
//       {isMuted ? <IconMute color="#77838F" /> : <IconVolume />}
//     </TouchableOpacity>
//   );
// };
// export default NavVolumeToggleButton;
