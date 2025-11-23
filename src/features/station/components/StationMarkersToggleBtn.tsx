import { TouchableOpacity } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { RefObject, use, useEffect, useState } from 'react';
import WebView from 'react-native-webview';
import IconStationMarkerOn from '@/shared/components/icons/IconStationMarkerOn';
import IconStationMarkerOff from '@/shared/components/icons/IconStationMarkerOff';
import { ToggleStationMarkersMessage } from '@/shared/model/map.webview.types';
import { useMapWebview } from '@/features/map/hooks/useMapWebview';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useMapStore } from '@/features/map/stores/useMapStore';

const StationMarkersToggleBtn = () => {
  const { sendMessage } = useMapWebview();
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
