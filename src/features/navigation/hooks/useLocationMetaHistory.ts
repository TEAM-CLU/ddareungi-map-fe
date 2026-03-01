import { useEffect, type RefObject } from 'react';
import { LocationMetaData } from '@/features/navigation/model/navigation.types';

export interface UseLocationMetaHistoryParams {
  isNavigationMode: boolean;
  isNavigationInitialized: boolean;
  locationMetaData: LocationMetaData | null;
  locationTick: number | undefined;
  prevLocationMetaData: RefObject<LocationMetaData | null>;
  currentLocationMetaData: RefObject<LocationMetaData | null>;
}

export const useLocationMetaHistory = ({
  isNavigationMode,
  isNavigationInitialized,
  locationMetaData,
  locationTick,
  prevLocationMetaData,
  currentLocationMetaData,
}: UseLocationMetaHistoryParams) => {
  // prevLocationMetaData와 currentLocationMetaData 구분 저장
  useEffect(() => {
    if (!isNavigationMode || !locationMetaData || !isNavigationInitialized)
      return;
    prevLocationMetaData.current = currentLocationMetaData.current;
    currentLocationMetaData.current = locationMetaData;
  }, [locationTick, isNavigationMode, isNavigationInitialized]);
};
