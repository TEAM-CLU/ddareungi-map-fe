import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface NavigationState {
  isNavigationMode: boolean;
  setIsNavigationMode: (isNavigationMode: boolean) => void;

  routeId: string | null;
  setRouteId: (routeId: string | null) => void;

  totalCaloriesBurned: number;
  totalCarbonSaved: number;

  setTotalCaloriesBurned: (calories: number) => void;
  setTotalCarbonSaved: (carbon: number) => void;

  addCaloriesBurned: (delta: number) => void;
  addCarbonSaved: (delta: number) => void;

  resetMeasures: () => void;
}

export const useNavigationStore = create<NavigationState>()(
  devtools(
    set => ({
      isNavigationMode: false,
      routeId: null,

      setRouteId: (routeId: string | null) =>
        set({ routeId }, false, 'navigation/setRouteId'),

      setIsNavigationMode: (isNavigationMode: boolean) =>
        set({ isNavigationMode }, false, 'navigation/setIsNavigationMode'),

      totalCaloriesBurned: 0,
      totalCarbonSaved: 0,

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

      resetMeasures: () =>
        set(
          { totalCaloriesBurned: 0, totalCarbonSaved: 0 },
          false,
          'navigation/resetMeasures',
        ),
    }),
    { name: 'navigation' },
  ),
);
