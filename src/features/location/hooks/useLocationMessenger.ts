import { useProvideWebviewMessenger } from '@/features/map/hooks/useProvideWebviewMessenger';
import {
  CompassModeMessage,
  MyLocationFollowingMessage,
} from '@/shared/model/map.webview.types';
import { useCallback } from 'react';

export const useLocationMessenger = () => {
  const { sendMessage } = useProvideWebviewMessenger();

  const myLocationFollowing = useCallback(() => {
    const message: MyLocationFollowingMessage = {
      type: 'myLocationFollowing',
    };
    sendMessage(message);
  }, [sendMessage]);

  const myLocationCompassOn = useCallback(() => {
    const message: CompassModeMessage = {
      type: 'myLocationCompassOn',
      isCompassMode: true,
    };
    sendMessage(message);
  }, [sendMessage]);

  const myLocationCompassOff = useCallback(() => {
    const message: CompassModeMessage = {
      type: 'myLocationCompassOff',
      isCompassMode: false,
    };
    sendMessage(message);
  }, [sendMessage]);

  return {
    myLocationFollowing,
    myLocationCompassOn,
    myLocationCompassOff,
  };
};
