import { useMapWebview } from '@/features/map/hooks/useMapWebview';
import { ToggleBookmarkMarkersMessage } from '@/shared/model/map.webview.types';
import { tw } from '@/shared/libs/tw-helper';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { IconStar } from '../icons';

const BookmarkMarkersToggleButton = () => {
  const { sendMessage } = useMapWebview();
  const [mode, setMode] = useState<'on' | 'off'>('on');

  const handleToggleBtnPress = () => {
    if (mode === 'on') {
      setMode('off');
      const message: ToggleBookmarkMarkersMessage = {
        type: 'toggleBookmarkMarkers',
        isVisible: false,
      };
      sendMessage(message);
      return;
    }

    if (mode === 'off') {
      setMode('on');
      const message: ToggleBookmarkMarkersMessage = {
        type: 'toggleBookmarkMarkers',
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
      {mode === 'on' ? <IconStar fillColor='#01da86' strokeColor='#01da86'/> : <IconStar fillColor='white' strokeColor='#77838f'/>}
    </TouchableOpacity>
  );
};

export default BookmarkMarkersToggleButton;
