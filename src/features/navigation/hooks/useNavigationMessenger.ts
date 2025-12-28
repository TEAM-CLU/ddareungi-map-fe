import { useProvideWebviewMessenger } from '@/shared/hooks/useProvideWebviewMessenger';
import { ChangeMyLocationMarker } from '@/shared/model/map.webview.types';
import { use, useCallback } from 'react';

export const useNavigationMessenger = () => {
  const { sendMessage } = useProvideWebviewMessenger();

  const changeMyLocationMarker = useCallback(() => {
    const message: ChangeMyLocationMarker = {
      type: 'changeMyLocationMarker',
    };
    sendMessage(message);
  }, [sendMessage]);

  return {
    changeMyLocationMarker,
  };
};
