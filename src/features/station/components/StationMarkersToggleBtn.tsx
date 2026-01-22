import { TouchableOpacity } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { useState } from 'react';
import IconStationMarkerOn from '@/shared/components/icons/IconStationMarkerOn';
import IconStationMarkerOff from '@/shared/components/icons/IconStationMarkerOff';
import { useStationMessenger } from '@/features/station/hooks/useStationMessenger';

const StationMarkersToggleBtn = () => {
  const { turnOnStationMarkers, turnOffStationMarkers } = useStationMessenger();
  const [mode, setMode] = useState<'on' | 'off'>('on');

  const handleToggleShowingStationMarkersPress = () => {
    if (mode === 'on') {
      setMode('off');
      turnOffStationMarkers();
      return;
    }

    if (mode === 'off') {
      setMode('on');
      turnOnStationMarkers();
      return;
    }
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
      {mode === 'on' ? <IconStationMarkerOn /> : <IconStationMarkerOff />}
    </TouchableOpacity>
  );
};

export default StationMarkersToggleBtn;
