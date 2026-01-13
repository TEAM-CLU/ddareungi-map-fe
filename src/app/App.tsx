import React, { useEffect } from 'react';
import DevHub from '@/app/routes/DevHub';
import TrackPlayer from 'react-native-track-player';
import { registerTtsQueueHandler } from '@/features/navigation/libs/ttsPlayer';

const App = () => {
  useEffect(() => {
    const setupTrackPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          capabilities: [],
        });
        registerTtsQueueHandler();
      } catch (error) {
        console.warn('TrackPlayer setup failed:', error);
      }
    };

    setupTrackPlayer();
  }, []);
  return <DevHub />;
};

export default App;
