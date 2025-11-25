import { UpdateTargetedStationBikeCountListMessage } from './../../../shared/model/map.webview.types';
import {
  MapAreaStationData,
  StationLatestBikeCountData,
} from '@/features/station/model/station.types';
import { useProvideWebviewMessenger } from '@/shared/hooks/useProvideWebviewMessenger';
import { UpdateStationDataListMessage } from '@/shared/model/map.webview.types';
import { useCallback } from 'react';

export const useStationMessenger = () => {
  const { sendMessage } = useProvideWebviewMessenger();

  const updateStationDataList = useCallback(
    (stationDataList: MapAreaStationData[]) => {
      const message: UpdateStationDataListMessage = {
        type: 'updateStationDataList',
        stations: stationDataList,
      };
      sendMessage(message);
    },
    [sendMessage],
  );

  const UpdateTargetedStationBikeCountListMessage = useCallback(
    (stationBikeCountList: StationLatestBikeCountData[]) => {
      const message: UpdateTargetedStationBikeCountListMessage = {
        type: 'updateTargetedStationBikeCountList',
        stationBikeCountList: stationBikeCountList,
      };
      sendMessage(message);
    },
    [sendMessage],
  );

  return {
    updateStationDataList,
    UpdateTargetedStationBikeCountListMessage,
  };
};
