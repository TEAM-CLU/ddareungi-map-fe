import { useLocationStore } from '@/features/location/stores/useLocationStore';
import { useMapWebview } from '@/features/map/hooks/useMapWebview';
import IconLocatorMark from '@/shared/components/icons/IconLocatorMark';
import { tw } from '@/shared/libs/tw-helper';
import {
  CompassModeMessage,
  MyLocationFollowingMessage,
} from '@/shared/model/map.webview.types';
import { TouchableOpacity } from 'react-native';

const MyLocationButton = () => {
  const { sendMessage } = useMapWebview();
  const { locationMode, setLocationMode } = useLocationStore();

  const handleMyLocationButtonPress = () => {
    if (locationMode === 'default') {
      // 단순히 내 위치로 포커싱 이동
      setLocationMode('following');
      const message: MyLocationFollowingMessage = {
        type: 'myLocationFollowing',
      };
      sendMessage(message);
    }
    if (locationMode === 'following') {
      // 내 방향대로 지도 회전
      setLocationMode('compass');
      const message: CompassModeMessage = {
        type: 'myLocationCompassOn',
        isCompassMode: true,
      };
      sendMessage(message);
    }
    if (locationMode === 'compass') {
      setLocationMode('default');
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
          'bg-icon-container-secondary rounded-full w-10 h-10 flex justify-center items-center shadow-md',
        ),
        { zIndex: 10 },
      ]}
    >
      <IconLocatorMark
        color={locationMode === 'compass' ? '#01DA86' : '#77838F'}
      />
    </TouchableOpacity>
  );
};
export default MyLocationButton;
