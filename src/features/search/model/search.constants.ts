export const SEARCH_CONSTANTS = {
  // API 설정
  KAKAO_BASE_URL: 'https://dapi.kakao.com/v2/local/search',

  // 검색 옵션 기본값
  DEFAULT_PAGE_SIZE: 15,
  DEFAULT_SEARCH_RADIUS: 10000, // 10km
  DEFAULT_DEBOUNCE_DELAY: 200, // ms (자동완성을 위해 300ms에서 200ms로 단축)
  MIN_SEARCH_LENGTH: 1, // 최소 검색어 길이
  
  // 검색 정렬 옵션
  SORT_OPTIONS: {
    DISTANCE: 'distance',
    ACCURACY: 'accuracy',
  },

  // UI 애니메이션 설정
  ANIMATION_DURATION: 100, // ms (빠른 반응을 위해 단축)

  // 에러 메시지
  ERROR_MESSAGES: {
    API_KEY_NOT_SET: 'Kakao API Key is not configured',
    API_REQUEST_FAILED: 'Kakao API request failed',
    SEARCH_FAILED: '검색 중 오류가 발생했습니다.',
  },
} as const;
