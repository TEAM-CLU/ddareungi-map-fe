import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TimerStatus } from '../model/navigation.types';

interface NavigationState {
  isNavigationMode: boolean;
  setIsNavigationMode: (isNavigationMode: boolean) => void;

  routeId: string | null;
  setRouteId: (routeId: string | null) => void;

  sessionId: string | null;
  setSessionId: (sessionId: string | null) => void;

  totalCaloriesBurned: number;
  totalCarbonSaved: number;

  traveledDistanceMeter: number | undefined | null;
  setTraveledDistanceMeter: (distance: number | undefined | null) => void;

  seconds: number;
  setSeconds: (seconds: number) => void;

  timerStatus: TimerStatus;
  setTimerStatus: (status: TimerStatus) => void;

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
      sessionId: null,
      totalCaloriesBurned: 0,
      totalCarbonSaved: 0,
      traveledDistanceMeter: null,
      seconds: 0,
      timerStatus: 'idle',

      setSeconds: (seconds: number) =>
        set({ seconds }, false, 'navigation/setSeconds'),

      setTimerStatus: (status: TimerStatus) =>
        set({ timerStatus: status }, false, 'navigation/setTimerStatus'),

      setRouteId: (routeId: string | null) =>
        set({ routeId }, false, 'navigation/setRouteId'),

      setSessionId: (sessionId: string | null) =>
        set({ sessionId }, false, 'navigation/setSessionId'),

      setIsNavigationMode: (isNavigationMode: boolean) =>
        set({ isNavigationMode }, false, 'navigation/setIsNavigationMode'),

      setTotalCaloriesBurned: (calories: number) =>
        set(
          { totalCaloriesBurned: calories },
          false,
          'navigation/setTotalCaloriesBurned',
        ),

      setTotalCarbonSaved: (carbon: number) =>
        set(
          { totalCarbonSaved: carbon },
          false,
          'navigation/setTotalCarbonSaved',
        ),

      addCaloriesBurned: (delta: number) =>
        set(
          state => ({ totalCaloriesBurned: state.totalCaloriesBurned + delta }),
          false,
          'navigation/addCaloriesBurned',
        ),

      addCarbonSaved: (delta: number) =>
        set(
          state => ({ totalCarbonSaved: state.totalCarbonSaved + delta }),
          false,
          'navigation/addCarbonSaved',
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
            sessionId: null,
            totalCaloriesBurned: 0,
            totalCarbonSaved: 0,
            traveledDistanceMeter: null,
            seconds: 0,
            timerStatus: 'idle',
          },
          false,
          'navigation/resetAllData',
        ),
    }),
    { name: 'navigation' },
  ),
);
