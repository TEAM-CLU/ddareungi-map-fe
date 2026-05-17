import TrackPlayer, { Event } from 'react-native-track-player';

export const trackPlayerService = async () => {
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });
  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.stop();
  });
};
