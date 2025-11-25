import {
  ToggleStationMarkersMessage,
  UpdateTargetedStationBikeCountListMessage,
} from './../../../shared/model/map.webview.types';
import {
  MapAreaStationData,
  StationLatestBikeCountData,
} from '@/features/station/model/station.types';
import { useProvideWebviewMessenger } from '@/shared/hooks/useProvideWebviewMessenger';
import {
  UpdateStationDataListMessage,
  FocusOnTargetedNearbyStationMessage,
} from '@/shared/model/map.webview.types';
import { useCallback } from 'react';

export const useStationMessenger = () => {
  const { sendMessage } = useProvideWebviewMessenger();

  const focusOnTargetedNearbyStation = useCallback(
    (targetedStationData: MapAreaStationData) => {
      const message: FocusOnTargetedNearbyStationMessage = {
        type: 'focusOnTargetedNearbyStation',
        targetedStationData: targetedStationData,
      };
      sendMessage(message);
    },
    [sendMessage],
  );

  const turnOnStationMarkers = useCallback(() => {
    const message: ToggleStationMarkersMessage = {
      type: 'toggleStationMarkers',
      isVisible: true,
    };
    sendMessage(message);
  }, [sendMessage]);

  const turnOffStationMarkers = useCallback(() => {
    const message: ToggleStationMarkersMessage = {
      type: 'toggleStationMarkers',
      isVisible: false,
    };
    sendMessage(message);
  }, [sendMessage]);

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

  const updateTargetedStationBikeCountListMessage = useCallback(
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
    focusOnTargetedNearbyStation,
    turnOnStationMarkers,
    turnOffStationMarkers,
    updateStationDataList,
    updateTargetedStationBikeCountListMessage,
  };
};
