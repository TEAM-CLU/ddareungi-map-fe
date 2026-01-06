import { useProvideWebviewMessenger } from '@/shared/hooks/useProvideWebviewMessenger';
import { ReplaceMyLocationMarker } from '@/shared/model/map.webview.types';
import { useCallback } from 'react';

export const useNavigationMessenger = () => {
  const { sendMessage } = useProvideWebviewMessenger();

  const replaceMyLocationMarker = useCallback(
    (isNavigationMode: boolean) => {
      const message: ReplaceMyLocationMarker = {
        type: 'replaceMyLocationMarker',
        isNavigationMode: isNavigationMode,
      };
      sendMessage(message);
    },
    [sendMessage],
  );

  return {
    replaceMyLocationMarker,
  };
};
