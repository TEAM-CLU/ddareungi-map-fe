import { useLocationMessenger } from '@/features/location/hooks/useLocationMessenger';
import { useLocationStore } from '@/features/location/stores/useLocationStore';
import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore';
import IconLocatorMark from '@/shared/components/icons/IconLocatorMark';
import { tw } from '@/shared/libs/tw-helper';
import { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';

const MyLocationButton = () => {
  const { locationMode, setLocationMode } = useLocationStore();
  const { isNavigationMode } = useNavigationStore();
  const { setCenterOnMyLocation, myLocationCompassOn, myLocationCompassOff } =
    useLocationMessenger();

  const handleMyLocationBtnPress = () => {
    if (locationMode === 'default') {
      // 단순히 내 위치로 포커싱 이동
      setLocationMode('following');
      setCenterOnMyLocation();
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

  useEffect(() => {
    if (!isNavigationMode) return;

    setLocationMode('compass');
    myLocationCompassOn();
  }, [isNavigationMode]);

  return (
    <TouchableOpacity
      disabled={isNavigationMode}
      onPress={handleMyLocationBtnPress}
      style={[
        tw('rounded-full w-10 h-10 flex justify-center items-center shadow-md'),
        { backgroundColor: locationMode === 'compass' ? '#01DA86' : '#FFFFFF' },
        { zIndex: 10 },
      ]}
    >
      <IconLocatorMark
        color={locationMode === 'compass' ? '#FFFFFF' : '#77838F'}
      />
    </TouchableOpacity>
  );
};
export default MyLocationButton;
