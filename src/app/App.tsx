import React, { useEffect, useState } from 'react';
import AppNavigator from './routes/AppNavigator';
import { useAuth } from './providers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BootSplash from 'react-native-bootsplash';

const App = () => {
  const { isAuthLoading, accessToken } = useAuth();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

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

  return <AppNavigator initialRouteName={initialRoute}/>;
};

export default App;
