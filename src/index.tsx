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
import { trackPlayerService } from '@/features/navigation/utils/trackPlayerService';
import TrackPlayer from 'react-native-track-player';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 재시도는 1회만 (기본 3회 → 각 재시도마다 인터셉터 토스트가 중복 발생하는 문제 방지)
      retry: 1,
      retryDelay: 2000,
    },
  },
});
TrackPlayer.registerPlaybackService(() => trackPlayerService);

const Root = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TailwindProvider>
        <WebViewRefProvider>
          <SafeAreaProvider>
            <PaperProvider>
              <QueryClientProvider client={queryClient}>
                <AuthProvider>
                  <BottomSheetModalProvider>
                    <App />
                  </BottomSheetModalProvider>
                </AuthProvider>
              </QueryClientProvider>
            </PaperProvider>
          </SafeAreaProvider>
        </WebViewRefProvider>
      </TailwindProvider>
    </GestureHandlerRootView>
  );
};

AppRegistry.registerComponent(appName, () => Root);
