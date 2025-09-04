import React from 'react';
import { AppRegistry } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { name as appName } from '../app.json';
import App from './app/App';
import { TailwindProvider } from '@/app/providers';

const Root = () => {
  return (
    <TailwindProvider>
      <SafeAreaProvider>
        <App />
      </SafeAreaProvider>
    </TailwindProvider>
  );
};

AppRegistry.registerComponent(appName, () => Root);
