import { TouchableOpacity } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { useState } from 'react';
import IconStationMarkerOn from '@/shared/components/icons/IconStationMarkerOn';
import IconStationMarkerOff from '@/shared/components/icons/IconStationMarkerOff';
import { ToggleStationMarkersMessage } from '@/shared/model/map.webview.types';
import { useProvideWebviewMessenger } from '@/shared/hooks/useProvideWebviewMessenger';

const StationMarkersToggleBtn = () => {
  const { sendMessage } = useProvideWebviewMessenger();
  const [mode, setMode] = useState<'on' | 'off'>('on');

  const handleToggleBtnPress = () => {
    if (mode === 'on') {
      setMode('off');
      const message: ToggleStationMarkersMessage = {
        type: 'toggleStationMarkers',
        isVisible: false,
      };
      sendMessage(message);
      return;
    }

    if (mode === 'off') {
      setMode('on');
      const message: ToggleStationMarkersMessage = {
        type: 'toggleStationMarkers',
        isVisible: true,
      };
      sendMessage(message);
      return;
    }
  };

  return (
    <TouchableOpacity
      onPress={handleToggleBtnPress}
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
