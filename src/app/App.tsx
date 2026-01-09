import React, { useEffect } from 'react';
import DevHub from '@/app/routes/DevHub';
import TrackPlayer from 'react-native-track-player';
import { trackPlayerService } from '@/features/navigation/utils/trackPlayerService';
import { registerTtsQueueHandler } from '@/features/navigation/libs/ttsPlayer';

const App = () => {
  TrackPlayer.registerPlaybackService(() => trackPlayerService);

  useEffect(() => {
    const setupTrackPlayer = async () => {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [],
      });

      registerTtsQueueHandler();
    };

    setupTrackPlayer();
  }, []);

  return <DevHub />;
};

export default App;
