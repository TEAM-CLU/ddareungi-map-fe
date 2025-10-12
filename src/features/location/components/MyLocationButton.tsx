import IconLocation from '@/shared/components/icons/IconLocation';
import IconLocatorMark from '@/shared/components/icons/IconLocatorMark';
import { tw } from '@/shared/libs/tw-helper';
import { useRef, useState } from 'react';
import { Touchable, TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';

interface MyLocationButtonProps {
  webRef: React.RefObject<WebView | null>;
}
const MyLocationButton = ({ webRef }: MyLocationButtonProps) => {
  const [mode, setMode] = useState<'default' | 'following' | 'compass'>(
    'default',
  );

  const handleMyLocationButtonPress = () => {
    if (mode === 'default') {
      // 단순히 내 위치로 포커싱 이동
      setMode('following');
      webRef.current?.postMessage(
        JSON.stringify({
          type: 'myLocationFollowing',
        }),
      );
    }
    if (mode === 'following') {
      // 내 방향대로 지도 회전
      setMode('compass');
      webRef.current?.postMessage(
        JSON.stringify({
          type: 'myLocationCompassOn',
          isCompassMode: true,
        }),
      );
    }
    if (mode === 'compass') {
      setMode('default');
      webRef.current?.postMessage(
        JSON.stringify({
          type: 'myLocationCompassOff',
          isCompassMode: false,
        }),
      );
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
