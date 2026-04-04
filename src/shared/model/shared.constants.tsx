import {
  IconBicycle,
  IconMypage,
  IconRecommendedPath,
  IconRun,
  IconStar,
} from '../components/icons';
import { FooterRoutes } from './shared.types';

export const BUTTON_PRESETS = {
  // 가장 큰 버튼
  lg: {
    minWidth: 264,
    height: 42,
    borderRadius: 20,
    backgroundColor: '#01DA86',
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    paddingHorizontal: 16,
  },
  // 인증하기, 확인하기 버튼
  sm: {
    minWidth: 70,
    height: 26,
    borderRadius: 20,
    backgroundColor: '#77838F',
    fontSize: 10,
    fontFamily: 'Pretendard-Bold',
    paddingHorizontal: 18,
  },
  // 출발, 원점 버튼
  origin: {
    minWidth: 65,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#01DA86',
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    paddingHorizontal: 16,
  },
  // 도착, 반환점 버튼
  destination: {
    minWidth: 65,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#77838F',
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    paddingHorizontal: 16,
  },
};

// 현재 연도
export const CURRENT_YEAR = new Date().getFullYear();

// 서버 주소
export const SERVER_URL = 'https://ssumpick.com';

// AsyncStorage에 저장할 토큰 키
export const ACCESS_TOKEN_KEY = '@auth_access_token';

// AsyncStorage에 저장할 유저 정보 키
export const USER_INFO_KEY = '@user_info';

// footer 메뉴
export const FOOTER_MENU: {
  name: string;
  screen: FooterRoutes;
  label: string;
  icon: JSX.Element;
}[] = [
  {
    name: 'station',
    screen: 'Map',
    label: '대여소',
    icon: <IconBicycle width={30} height={30} />,
  },
  {
    name: 'routeRecommend',
    screen: 'RouteRecommend',
    label: '추천 경로',
    icon: <IconRecommendedPath width={30} height={30} />,
  },
  {
    name: 'measurement',
    screen: 'Measure',
    label: '측정 모드',
    icon: <IconRun width={30} height={30} color="white" />,
  },
  {
    name: 'mypage',
    screen: 'Mypage',
    label: '마이 페이지',
    icon: <IconMypage width={30} height={30} />,
  },
  {
    name: 'bookmark',
    screen: 'Map',
    label: '즐겨찾기',
    icon: (
      <IconStar
        width={23}
        height={23}
        fillColor="#01DA86"
        strokeColor="white"
        strokeWidth={2.2}
      />
    ),
  },
];

// measure.ts - 평균 신체정보
export const MEAN_ADULT_PHYSICAL_INFORMATION = {
  MEAN_ADULT_MAN_WEIGHT_KG: 72,
  MEAN_ADULT_WOMAN_WEIGHT_KG: 58,
  MEAN_ADULT_NEUTRAL_WEIGHT_KG: 65,
};

// 평균 활동 대사량(MET)
export const MEAN_ACITIVITY_MET = {
  MEAN_WALKING_MET: 3.3,
  MEAN_BIKING_MET: 6,
};

// measure.ts - 탄소배출계수
export const MEAN_CARBON_EMISSION = {
  EMISSION_CAR_PER_KM: 0.21,
  EMISSION_WALKING_PER_KM: 0.05,
  EMISSION_BIKING_PER_KM: 0.02,
};

// 칼로리 연령 보정
export const CALORIE_AGE_FACTORS = [
  { minAge: 0, weight: 1.03 },
  { minAge: 20, weight: 1.0 },
  { minAge: 40, weight: 0.97 },
  { minAge: 60, weight: 0.94 },
] as const;

export const DEFAULT_CALORIE_AGE_FACTOR = 1.0;
export const MAX_SUPPORTED_AGE = 120;
