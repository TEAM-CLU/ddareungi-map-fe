import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface NavigationState {
  isNavigationMode: boolean;
  setIsNavigationMode: (isNavigationMode: boolean) => void;

  routeId: string | null;
  setRouteId: (routeId: string | null) => void;

  totalCaloriesBurned: number;
  totalCarbonSaved: number;

  traveledDistanceMeter: number | undefined | null;
  setTraveledDistanceMeter: (distance: number | undefined | null) => void;

  seconds: number;
  setSeconds: (seconds: number) => void;

  setTotalCaloriesBurned: (calories: number) => void;
  setTotalCarbonSaved: (carbon: number) => void;

  addCaloriesBurned: (delta: number) => void;
  addCarbonSaved: (delta: number) => void;
  addSeconds: (delta: number) => void;

  resetAllData: () => void;
}

export const useNavigationStore = create<NavigationState>()(
  devtools(
    set => ({
      isNavigationMode: false,
      routeId: null,
      totalCaloriesBurned: 0,
      totalCarbonSaved: 0,
      traveledDistanceMeter: null,
      seconds: 0,

      setSeconds: (seconds: number) =>
        set({ seconds }, false, 'navigation/setSeconds'),

      setRouteId: (routeId: string | null) =>
        set({ routeId }, false, 'navigation/setRouteId'),

      setIsNavigationMode: (isNavigationMode: boolean) =>
        set({ isNavigationMode }, false, 'navigation/setIsNavigationMode'),

      setTotalCaloriesBurned: (calories: number) =>
        set(
          { totalCaloriesBurned: calories },
          false,
          'navigation/setTotalCaloriesBurned',
        ),

      setTotalCarbonReduced: (carbon: number) =>
        set(
          { totalCarbonSaved: carbon },
          false,
          'navigation/setTotalCarbonReduced',
        ),

      addCaloriesBurned: (delta: number) =>
        set(
          state => ({ totalCaloriesBurned: state.totalCaloriesBurned + delta }),
          false,
          'navigation/addCaloriesBurned',
        ),

      addCarbonReduced: (delta: number) =>
        set(
          state => ({ totalCarbonSaved: state.totalCarbonSaved + delta }),
          false,
          'navigation/addCarbonReduced',
        ),

      addSeconds: (delta: number) =>
        set(
          state => ({ seconds: state.seconds + delta }),
          false,
          'navigation/addSeconds',
        ),

      setTraveledDistanceMeter: (distance: number | undefined | null) =>
        set(
          { traveledDistanceMeter: distance },
          false,
          'navigation/setTraveledDistanceMeter',
        ),

      resetAllData: () =>
        set(
          {
            isNavigationMode: false,
            routeId: null,
            totalCaloriesBurned: 0,
            totalCarbonSaved: 0,
            traveledDistanceMeter: null,
            seconds: 0,
          },
          false,
          'navigation/resetAllData',
        ),
    }),
    { name: 'navigation' },
  ),
);
