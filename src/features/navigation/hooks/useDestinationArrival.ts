import { useEffect, useRef, type RefObject } from 'react';
import {
  ACCURACY_OK,
  REMAINING_DISTANCE_OPTIONS,
} from '@/features/navigation/model/navigation.constants';
import {
  LocationMetaData,
  NavigationInstruction,
  TimerStatus,
} from '@/features/navigation/model/navigation.types';
import { clearSharedTimer } from '@/features/navigation/hooks/useTimer';
import { getDistanceBetweenCoords } from '@/shared/utils/measure';

const ARRIVAL_CONFIRM_COUNT = 2;
const ARRIVAL_NEAR_INTERVAL_COUNT = 2;
const DESTINATION_PROXIMITY_METER = 15;

export interface UseDestinationArrivalParams {
  isNavigationMode: boolean;
  isNavigationInitialized: boolean;
  locationMetaData: LocationMetaData | null;
  locationTick: number | undefined;
  remainingDistanceMeter: number | null | undefined;
  setIsNavigationMode: (isNavigationMode: boolean) => void;
  setTimerStatus: (status: TimerStatus) => void;
  setShowNavigationEndModal: (isVisible: boolean) => void;
  setShowNavigationFinishModal: (isVisible: boolean) => void;
  refs: {
    currentIntervalIndex: RefObject<number>;
    instructionList: RefObject<NavigationInstruction[]>;
  };
}

export const useDestinationArrival = ({
  isNavigationMode,
  isNavigationInitialized,
  locationMetaData,
  locationTick,
  remainingDistanceMeter,
  setIsNavigationMode,
  setTimerStatus,
  setShowNavigationEndModal,
  setShowNavigationFinishModal,
  refs,
}: UseDestinationArrivalParams) => {
  const confirmCountRef = useRef(0);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (isNavigationMode && isNavigationInitialized) {
      confirmCountRef.current = 0;
      hasTriggeredRef.current = false;
    }
  }, [isNavigationMode, isNavigationInitialized]);

  useEffect(() => {
    if (
      !isNavigationMode ||
      !isNavigationInitialized ||
      remainingDistanceMeter == null ||
      !locationMetaData
    ) {
      confirmCountRef.current = 0;
      return;
    }

    const instructionCount = refs.instructionList.current.length;
    if (instructionCount === 0) {
      confirmCountRef.current = 0;
      return;
    }

    const currentAccuracy = locationMetaData.accuracy;
    if (typeof currentAccuracy === 'number' && currentAccuracy > ACCURACY_OK) {
      confirmCountRef.current = 0;
      return;
    }

    const currentIntervalIndex = refs.currentIntervalIndex.current;
    const destinationCoord =
      refs.instructionList.current[instructionCount - 1]?.nextTurnCoordinate ??
      null;
    const distanceToDestinationMeter = destinationCoord
      ? getDistanceBetweenCoords(locationMetaData.coordinate, destinationCoord)
      : null;

    const isLastInterval = currentIntervalIndex >= instructionCount - 1;
    const isNearLastInterval =
      currentIntervalIndex >= instructionCount - ARRIVAL_NEAR_INTERVAL_COUNT;
    const isCloseByRemainingDistance =
      remainingDistanceMeter <=
      REMAINING_DISTANCE_OPTIONS.REACHED_JUDGE_DISTANCE_METER;
    const isCloseByDestinationCoord =
      distanceToDestinationMeter != null &&
      distanceToDestinationMeter <= DESTINATION_PROXIMITY_METER;
    const isInArrivalWindow =
      isLastInterval || (isNearLastInterval && isCloseByDestinationCoord);
    const hasReachedDestination =
      isCloseByRemainingDistance || isCloseByDestinationCoord;

    if (!isInArrivalWindow || !hasReachedDestination) {
      confirmCountRef.current = 0;
      return;
    }

    confirmCountRef.current += 1;
    const requiredConfirmCount = isCloseByDestinationCoord
      ? 1
      : ARRIVAL_CONFIRM_COUNT;
    if (confirmCountRef.current < requiredConfirmCount) return;
    if (hasTriggeredRef.current) return;

    hasTriggeredRef.current = true;
    clearSharedTimer();
    setTimerStatus('paused');
    setShowNavigationEndModal(false);
    setShowNavigationFinishModal(true);
    setIsNavigationMode(false);
  }, [
    isNavigationMode,
    isNavigationInitialized,
    locationTick,
    locationMetaData,
    remainingDistanceMeter,
    setIsNavigationMode,
    setTimerStatus,
    setShowNavigationEndModal,
    setShowNavigationFinishModal,
    refs,
  ]);
};
