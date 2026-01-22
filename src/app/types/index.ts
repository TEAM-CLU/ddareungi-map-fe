import { RouteType } from '@/features/routing/model/routing.types';
import { PlaceInfo } from '@/features/search/model/search.types';

export type RootStackParamList = {
  Landing: undefined;
  Onboarding: undefined;
  Login:
    | {
        state?: string;
      }
    | undefined;
  SignUp: undefined;
  Map:
    | {
        openSearchOverlay?: boolean; // 검색창 자동 열기 여부
        placeType?: string; // 현재 설정 중인 포인트 타입
        returnTo?: 'RouteSelect' | 'RouteRecommend'; // 돌아갈 화면
      }
    | undefined;
  RouteSelect:
    | {
        selectedPlace?: PlaceInfo; // 선택된 장소 정보
        placeType?: string; // 채워질 위치
        routeType?: RouteType; // 루프/일반 여부
      }
    | undefined;
  RouteRecommend:
    | {
        selectedPlace?: PlaceInfo; // 선택된 장소 정보
        placeType?: string; // 채워질 위치 ('start')
      }
    | undefined;
  Mypage: undefined;
};
