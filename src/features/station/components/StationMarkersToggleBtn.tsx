import { TouchableOpacity } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { useStationMessenger } from '@/features/station/hooks/useStationMessenger';
import { IconStationMarkerOff, IconStationMarkerOn } from '@/shared/components/icons';
import { useStationStore } from '@/features/station/stores/useStationStore';

const StationMarkersToggleBtn = () => {
  const { turnOnStationMarkers, turnOffStationMarkers } = useStationMessenger();
  const isStationMarkersVisible = useStationStore(
    state => state.isStationMarkersVisible,
  );
  const setStationMarkersVisible = useStationStore(
    state => state.setStationMarkersVisible,
  );

  const handleToggleShowingStationMarkersPress = () => {
    if (isStationMarkersVisible) {
      setStationMarkersVisible(false);
      turnOffStationMarkers();
      return;
    }

    setStationMarkersVisible(true);
    turnOnStationMarkers();
  };

  return (
    <TouchableOpacity
      onPress={handleToggleShowingStationMarkersPress}
      style={[
        tw(
          'bg-icon-container-secondary rounded-full w-10 h-10 flex justify-center items-center shadow-md',
        ),
        { zIndex: 10 },
      ]}
    >
      {isStationMarkersVisible ? (
        <IconStationMarkerOn />
      ) : (
        <IconStationMarkerOff />
      )}
    </TouchableOpacity>
  );
};

export default StationMarkersToggleBtn;
