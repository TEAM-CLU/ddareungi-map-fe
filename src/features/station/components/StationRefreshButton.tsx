import { MapAreaStationsResponse } from '@/features/station/model/station.types';
import { IconRefresh } from '@/shared/components/icons';
import { QueryObserverResult } from '@tanstack/react-query';
import { Touchable, TouchableOpacity } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';

interface StationRefreshButtonProps {
  onRefresh?: () => void;
}

const StationRefreshButton = ({ onRefresh }: StationRefreshButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        tw(
          'bg-icon-container-secondary rounded-full w-10 h-10 flex justify-center items-center shadow-md',
        ),
        { zIndex: 10 },
      ]}
    >
      <IconRefresh color="#77838F" />
    </TouchableOpacity>
  );
};

export default StationRefreshButton;
