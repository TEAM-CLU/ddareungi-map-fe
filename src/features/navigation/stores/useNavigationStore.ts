import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface NavigationState {
  isNavigationMode: boolean;
  setIsNavigationMode: (isNavigationMode: boolean) => void;

  routeId: string | null;
  setRouteId: (routeId: string) => void;
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
    }),
    { name: 'navigation' },
  ),
);
