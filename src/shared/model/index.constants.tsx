import {
  IconBicycle,
  IconMyPage,
  IconRecommendedPath,
} from '../components/icons';
import { IconStar } from '../components/icons';
import { FooterRoutes } from './index.types';

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
    name: 'myPage',
    screen: 'MyPage',
    label: '마이 페이지',
    icon: <IconMyPage width={30} height={30} />,
  },
  {
    name: 'bookmark',
    screen: 'Map',
    label: '즐겨찾기',
    icon: <IconStar width={23} height={23} fillColor='#01DA86' strokeColor='white' strokeWidth={2.2}/>,
  },
];

// measure.ts - 평균 신체정보
export const MEAN_ADULT_MAN_WEIGHT_KG = 72;
export const MEAN_ADULT_WOMAN_WEIGHT_KG = 58;
export const MEAN_ADULT_NEUTRAL_WEIGHT_KG = 65;
export const MEAN_WALKING_MET = 3.3;
export const MEAN_CYCLING_MET = 6;

// measure.ts - 탄소배출계수
export const EMISSION_CAR_PER_KM = 0.21;
export const EMISSION_WALKING_PER_KM = 0.05;
export const EMISSION_CYCLING_PER_KM = 0.02;

export const BOOKMARK_COLOR_PRESETS = ['#04C75B', '#FF3B30', '#FF9500', '#007AFF', '#5856D6', '#8E8E93'];