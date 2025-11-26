import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface NavigationState {
  canStartNavigation: boolean;
  setCanStartNavigation: (canStart: boolean) => void;

  routeId: string | null;
  setRouteId: (routeId: string) => void;
}

export const useNavigationStore = create<NavigationState>()(
  devtools(
    set => ({
      canStartNavigation: false,
      routeId: null,

      setRouteId: (routeId: string | null) =>
        set({ routeId }, false, 'navigation/setRouteId'),
      setCanStartNavigation: (canStart: boolean) =>
        set(
          { canStartNavigation: canStart },
          false,
          'navigation/setCanStartNavigation',
        ),
    }),
    { name: 'navigation' },
  ),
);
