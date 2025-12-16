import React from 'react';
import { AppRegistry } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { name as appName } from '../app.json';
import App from './app/App';
import { AuthProvider, TailwindProvider } from '@/app/providers';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { WebViewRefProvider } from '@/app/providers/webview';

const queryClient = new QueryClient();

const Root = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TailwindProvider>
        <WebViewRefProvider>
          <SafeAreaProvider>
            <PaperProvider>
              <AuthProvider>
                <QueryClientProvider client={queryClient}>
                  <BottomSheetModalProvider>
                    <App />
                  </BottomSheetModalProvider>
                </QueryClientProvider>
              </AuthProvider>
            </PaperProvider>
          </SafeAreaProvider>
        </WebViewRefProvider>
      </TailwindProvider>
    </GestureHandlerRootView>
  );
};

AppRegistry.registerComponent(appName, () => Root);
