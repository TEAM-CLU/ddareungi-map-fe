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
      }
    | undefined;
  RouteSelect: undefined;
  RouteRecommend: undefined;
  MyPage: undefined;
  TestCho: undefined;
  TestPark: undefined;
};
