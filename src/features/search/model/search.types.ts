// 카카오 API 관련 타입 정의
export interface KakaoSearchPlace {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string; // 경도 (longitude)
  y: string; // 위도 (latitude)
  place_url: string;
  distance: string;
}

export interface KakaoSearchResponse {
  documents: KakaoSearchPlace[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
    same_name: {
      region: string[];
      keyword: string;
      selected_region: string;
    };
  };
}

// 앱 내부 장소 정보 타입
export interface PlaceInfo {
  id: string;
  name: string;
  address: string;
  roadAddress?: string;
  latitude: number;
  longitude: number;
  category?: string;
  distance?: string;
}

// 검색 옵션 타입
export interface SearchOptions {
  x?: number; // 검색 중심점 경도
  y?: number; // 검색 중심점 위도
  radius?: number; // 검색 반경 (미터)
  page?: number; // 페이지 번호 (1~45)
  size?: number; // 한 페이지에 보여질 문서의 개수 (1~15)
  sort?: 'distance' | 'accuracy'; // 정렬 방식
}

// 자동완성 검색 결과 타입
export interface AutocompleteResult {
  placeKey: string; // 장소 고유 ID
  name: string; // 장소명 (예: 스타벅스 강남점)
  address: string; // 주소 (예: 서울 강남구...)
  latitude?: number; // 위도
  longitude?: number; // 경도
  distance?: string; // 현재 위치로부터의 거리 (m)
  category?: string; // 장소 카테고리 (카페, 음식점 등)
}

export interface UseAutocompleteOptions {
  // 디바운싱 지연 시간
  autoSearchDelay?: number;
}

export interface RecentSearchItem {
  placeKey: string;
  name: string;
  address: string;
  timestamp: number;
  latitude?: number;
  longitude?: number;
}
