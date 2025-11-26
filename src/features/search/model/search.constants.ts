export const KAKAO_BASE_URL = 'https://dapi.kakao.com/v2/local';

// 검색 옵션 기본값
export const DEFAULT_PAGE_SIZE = 15;
export const DEFAULT_SEARCH_RADIUS = 10000; // 10km
export const DEFAULT_DEBOUNCE_DELAY = 200; // ms
export const MIN_SEARCH_LENGTH = 1; // 최소 검색어 길이

// 에러 메시지
export const ERROR_MESSAGES = {
  API_KEY_NOT_SET: 'Kakao API Key is not configured',
  API_REQUEST_FAILED: 'Kakao API request failed',
  SEARCH_FAILED: '검색 중 오류가 발생했습니다.',
};

export const RECENT_SEARCH_KEY = '@ddareungi_recent_searches';
export const MAX_RECENT_SEARCHES = 10;