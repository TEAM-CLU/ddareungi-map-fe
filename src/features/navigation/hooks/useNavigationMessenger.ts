import { useProvideWebviewMessenger } from '@/shared/hooks/useProvideWebviewMessenger';
import {
  ReplaceMyLocationMarker,
  DrawNavigationPathMessage,
  UpdateNavigationCurrentIntervalMessage,
  ClearNavigationPathMessage,
  FocusOnNavigationPathMessage,
  NavigationPathData,
} from '@/shared/model/map.webview.types';
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

  const drawNavigationPath = useCallback(
    (navigationPathData: NavigationPathData) => {
      const message: DrawNavigationPathMessage = {
        type: 'drawNavigationPath',
        navigationPathData,
      };
      sendMessage(message);
    },
    [sendMessage],
  );

  const updateNavigationCurrentInterval = useCallback(
    (currentIntervalIndex: number) => {
      const message: UpdateNavigationCurrentIntervalMessage = {
        type: 'updateNavigationCurrentInterval',
        currentIntervalIndex,
      };
      sendMessage(message);
    },
    [sendMessage],
  );

  const clearNavigationPath = useCallback(() => {
    const message: ClearNavigationPathMessage = {
      type: 'clearNavigationPath',
    };
    sendMessage(message);
  }, [sendMessage]);

  const focusOnNavigationPath = useCallback(() => {
    const message: FocusOnNavigationPathMessage = {
      type: 'focusOnNavigationPath',
    };
    sendMessage(message);
  }, [sendMessage]);

  return {
    replaceMyLocationMarker,
    drawNavigationPath,
    updateNavigationCurrentInterval,
    clearNavigationPath,
    focusOnNavigationPath,
  };
};
