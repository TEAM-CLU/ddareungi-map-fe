import React, { useEffect } from 'react';
import DevHub from '@/app/routes/DevHub';
import TrackPlayer from 'react-native-track-player';
import { trackPlayerService } from '@/features/navigation/utils/trackPlayerService';

const App = () => {
  TrackPlayer.registerPlaybackService(() => trackPlayerService);

  useEffect(() => {
    const setupTrackPlayer = async () => {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [],
      });
    };

    setupTrackPlayer();
  }, []);

  return <DevHub />;
};

export default App;
