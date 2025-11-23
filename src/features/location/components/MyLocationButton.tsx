import { useMapWebview } from '@/features/map/hooks/useMapWebview';
import { useMapStore } from '@/features/map/stores/useMapStore';
import IconLocation from '@/shared/components/icons/IconLocation';
import IconLocatorMark from '@/shared/components/icons/IconLocatorMark';
import { tw } from '@/shared/libs/tw-helper';
import {
  CompassModeMessage,
  MyLocationFollowingMessage,
} from '@/shared/model/map.webview.types';
import { RefObject, useRef, useState } from 'react';
import { Touchable, TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';

const MyLocationButton = () => {
  const { sendMessage } = useMapWebview();
  const [mode, setMode] = useState<'default' | 'following' | 'compass'>(
    'default',
  );

  const handleMyLocationButtonPress = () => {
    if (mode === 'default') {
      // 단순히 내 위치로 포커싱 이동
      setMode('following');
      const message: MyLocationFollowingMessage = {
        type: 'myLocationFollowing',
      };
      sendMessage(message);
    }
    if (mode === 'following') {
      // 내 방향대로 지도 회전
      setMode('compass');
      const message: CompassModeMessage = {
        type: 'myLocationCompassOn',
        isCompassMode: true,
      };
      sendMessage(message);
    }
    if (mode === 'compass') {
      setMode('default');
      const message: CompassModeMessage = {
        type: 'myLocationCompassOff',
        isCompassMode: false,
      };
      sendMessage(message);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleMyLocationButtonPress}
      style={[
        tw(
          'bg-icon-container-primary rounded-full w-10 h-10 flex justify-center items-center shadow-md',
        ),
        { zIndex: 10 },
      ]}
    >
      <IconLocatorMark color={mode === 'compass' ? '#01DA86' : '#FFFFFF'} />
    </TouchableOpacity>
  );
};
export default MyLocationButton;
