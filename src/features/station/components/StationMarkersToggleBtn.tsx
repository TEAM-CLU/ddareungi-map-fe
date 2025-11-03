import { TouchableOpacity } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { RefObject, useState } from 'react';
import WebView from 'react-native-webview';
import IconStationMarkerOn from '@/shared/components/icons/IconStationMarkerOn';
import IconStationMarkerOff from '@/shared/components/icons/IconStationMarkerOff';
import { ToggleStationMarkersMessage } from '@/shared/model/map.webview.types';

interface StationMarkersToggleBtnProps {
  webRef: RefObject<WebView | null>;
}

const StationMarkersToggleBtn = ({ webRef }: StationMarkersToggleBtnProps) => {
  const [mode, setMode] = useState<'on' | 'off'>('on');

  const handleToggleBtnPress = () => {
    if (mode === 'on') {
      setMode('off');
      const toggleStationMarkersMessage: ToggleStationMarkersMessage = {
        type: 'toggleStationMarkers',
        isVisible: false,
      };
      webRef.current?.postMessage(JSON.stringify(toggleStationMarkersMessage));
      return;
    }

    if (mode === 'off') {
      setMode('on');
      const toggleStationMarkersMessage: ToggleStationMarkersMessage = {
        type: 'toggleStationMarkers',
        isVisible: true,
      };
      webRef.current?.postMessage(JSON.stringify(toggleStationMarkersMessage));
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
