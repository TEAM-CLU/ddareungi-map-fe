import { useLocationMessenger } from '@/features/location/hooks/useLocationMessenger';
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
  const { myLocationFollowing, myLocationCompassOn, myLocationCompassOff } =
    useLocationMessenger();

  const handleMyLocationButtonPress = () => {
    if (locationMode === 'default') {
      // 단순히 내 위치로 포커싱 이동
      setLocationMode('following');
      myLocationFollowing();
      return;
    }
    if (locationMode === 'following') {
      // 내 방향대로 지도 회전
      setLocationMode('compass');
      myLocationCompassOn();
      return;
    }
    if (locationMode === 'compass') {
      setLocationMode('default');
      myLocationCompassOff();
      return;
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
