import { AutocompleteResult } from "@/features/search/hooks/useAutocomplete";
import { RouteType } from "@/features/routing/model/routing.types";

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
        routeType?: RouteType;
      }
    | undefined;
  RouteRecommend: undefined;
  MyPage: undefined;
  TestCho: undefined;
  TestPark: undefined;
};
