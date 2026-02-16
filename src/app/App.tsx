import React, { useEffect, useState } from 'react';
import AppNavigator from './routes/AppNavigator';
import { useAuth } from './providers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BootSplash from 'react-native-bootsplash';
import { registerTtsQueueHandler } from '@/features/navigation/libs/ttsPlayer';
import TrackPlayer from 'react-native-track-player';
import { handleCatch } from '@/shared/utils/errorHandler';

const App = () => {
  const { isAuthLoading, accessToken } = useAuth();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const setupTrackPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer();
      } catch (error) {
        handleCatch(error, { mode: 'silent' });
      }

      try {
        await TrackPlayer.updateOptions({
          capabilities: [],
        });
        registerTtsQueueHandler();
      } catch (error) {
        handleCatch(error, { mode: 'silent' });
      }
    };

    setupTrackPlayer();
  }, []);

  useEffect(() => {
    const initApp = async () => {
      if (isAuthLoading) return;

      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

      if (accessToken) {
        setInitialRoute('Map');
      } else if (hasSeenOnboarding === 'YES') {
        setInitialRoute('Map');
      } else {
        setInitialRoute('Onboarding');
      }
    };
    initApp();
  }, [isAuthLoading, accessToken]);

  useEffect(() => {
    if (initialRoute) {
      BootSplash.hide({ fade: true });
    }
  }, [initialRoute]);

  if (!initialRoute) return null;

  return <AppNavigator initialRouteName={initialRoute} />;
};

export default App;
