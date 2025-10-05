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
export const SERVER_URL =
  'https://port-0-ddareungi-map-be-mff1z09ze559d642.sel3.cloudtype.app';

// AsyncStorage에 저장할 토큰 키
export const ACCESS_TOKEN_KEY = '@auth_access_token';
