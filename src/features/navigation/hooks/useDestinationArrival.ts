import { useEffect, useRef, type RefObject } from 'react';
import {
  ACCURACY_OK,
  REMAINING_DISTANCE_OPTIONS,
} from '@/features/navigation/model/navigation.constants';
import {
  LocationMetaData,
  NavigationInstruction,
} from '@/features/navigation/model/navigation.types';

const ARRIVAL_CONFIRM_COUNT = 2;

export interface UseDestinationArrivalParams {
  isNavigationMode: boolean;
  isNavigationInitialized: boolean;
  locationMetaData: LocationMetaData | null;
  locationTick: number | undefined;
  remainingDistanceMeter: number | null | undefined;
  setIsNavigationMode: (isNavigationMode: boolean) => void;
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

    const isLastInterval =
      refs.currentIntervalIndex.current >= instructionCount - 1;
    const hasReachedDestination =
      remainingDistanceMeter <=
      REMAINING_DISTANCE_OPTIONS.REACHED_JUDGE_DISTANCE_METER;

    if (!isLastInterval || !hasReachedDestination) {
      confirmCountRef.current = 0;
      return;
    }

    confirmCountRef.current += 1;
    if (confirmCountRef.current < ARRIVAL_CONFIRM_COUNT) return;
    if (hasTriggeredRef.current) return;

    hasTriggeredRef.current = true;
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
    setShowNavigationEndModal,
    setShowNavigationFinishModal,
    refs,
  ]);
};
