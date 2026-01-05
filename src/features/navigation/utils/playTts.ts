import TrackPlayer from 'react-native-track-player';

export const playTts = async (key: string, url: any, systemVolume: number) => {
  await TrackPlayer.reset();
  await TrackPlayer.add({
    id: key,
    url,
    title: 'Navigation Instruction',
    artist: 'Ddarungi Map',
  });
  await TrackPlayer.setVolume(systemVolume === 0 ? 0.5 : systemVolume);
  await TrackPlayer.play();
};
