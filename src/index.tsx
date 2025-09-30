import React from 'react';
import { AppRegistry } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { name as appName } from '../app.json';
import App from './app/App';
import { TailwindProvider } from '@/app/providers';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const Root = () => {
  const queryClient = new QueryClient();

  return (
    <TailwindProvider>
      <SafeAreaProvider>
        <PaperProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </TailwindProvider>
  );
};

AppRegistry.registerComponent(appName, () => Root);
