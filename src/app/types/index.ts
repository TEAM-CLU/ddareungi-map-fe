import { AutocompleteResult } from "@/features/search/hooks/useAutocomplete";

export type RootStackParamList = {
  DevHub: undefined;
  Landing: undefined;
  Onboarding: undefined;
  Login:
    | {
        state?: string;
      }
    | undefined;
  Register: undefined;
  Map:
    | {
        selectedPlace?: AutocompleteResult;
        openSearchOverlay?: boolean;
        placeType?: 'start' | 'end' | 'waypoint';
      }
    | undefined;
  RouteSelect: 
    | {
        selectedPlace?: AutocompleteResult;
        placeType?: 'start' | 'end' | 'waypoint';
      }
    | undefined;
  RouteRecommend: undefined;
  MyPage: undefined;
  TestCho: undefined;
  TestPark: undefined;
};
