import { useProvideWebviewMessenger } from '@/shared/hooks/useProvideWebviewMessenger';
import { ReplaceMyLocationMarker } from '@/shared/model/map.webview.types';
import { use, useCallback } from 'react';

export const useNavigationMessenger = () => {
  const { sendMessage } = useProvideWebviewMessenger();

  const replaceMyLocationMarker = useCallback(() => {
    const message: ReplaceMyLocationMarker = {
      type: 'replaceMyLocationMarker',
      isNavigationMode: true,
    };
    sendMessage(message);
  }, [sendMessage]);

  return {
    replaceMyLocationMarker,
  };
};
