import { useProvideWebviewMessenger } from '@/shared/hooks/useProvideWebviewMessenger';
import {
  CompassModeMessage,
  RotateMyHeadingMessage,
  SetCenterOnMyLocationMessage,
  UpdateMyLocationMessage,
} from '@/shared/model/map.webview.types';
import { useCallback } from 'react';

interface DataSetForUpdateMyLocation {
  lat: number;
  lng: number;
  accuracy: number;
}
export const useLocationMessenger = () => {
  const { sendMessage } = useProvideWebviewMessenger();

  const updateMyLocation = useCallback(
    (messageParam: DataSetForUpdateMyLocation) => {
      const message: UpdateMyLocationMessage = {
        type: 'updateMyLocation',
        ...messageParam,
      };
      sendMessage(message);
    },
    [sendMessage],
  );

  const setCenterOnMyLocation = useCallback(() => {
    const message: SetCenterOnMyLocationMessage = {
      type: 'setCenterOnMyLocation',
    };
    sendMessage(message);
  }, [sendMessage]);

  const rotateMyHeading = useCallback(
    (heading: number) => {
      const message: RotateMyHeadingMessage = {
        type: 'rotateMyHeading',
        heading: heading,
      };
      sendMessage(message);
    },
    [sendMessage],
  );

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
    updateMyLocation,
    setCenterOnMyLocation,
    rotateMyHeading,
    myLocationCompassOn,
    myLocationCompassOff,
  };
};
