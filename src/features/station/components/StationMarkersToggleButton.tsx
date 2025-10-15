import { MapAreaStationsResponse } from '@/features/station/model/station.types';
import {
  IconBicycle,
  IconBikeMarker,
  IconRefresh,
} from '@/shared/components/icons';
import { QueryObserverResult } from '@tanstack/react-query';
import { Touchable, TouchableOpacity } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { RefObject, useState } from 'react';
import WebView from 'react-native-webview';
import IconStationMarkerOn from '@/shared/components/icons/IconStationMarkerOn';
import IconStationMarkerOff from '@/shared/components/icons/IconStationMarkerOff';

interface StationMarkersToggleButtonProps {
  webRef: RefObject<WebView | null>;
}

const StationMarkersToggleButton = ({
  webRef,
}: StationMarkersToggleButtonProps) => {
  const [mode, setMode] = useState<'on' | 'off'>('on');

  const handleToggleButtonPress = () => {
    if (mode === 'on') {
      setMode('off');
      webRef.current?.postMessage(
        JSON.stringify({
          type: 'toggleStationMarkers',
          isVisible: false,
        }),
      );
    }

    if (mode === 'off') {
      setMode('on');
      webRef.current?.postMessage(
        JSON.stringify({
          type: 'toggleStationMarkers',
          isVisible: true,
        }),
      );
    }
  };
  return (
    <TouchableOpacity
      onPress={handleToggleButtonPress}
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

export default StationMarkersToggleButton;
