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

// 앱 내부 장소 정보 기준 타입
export interface PlaceInfo {
  placeId: string;
  name: string;
  address: string;
  roadAddress?: string;
  latitude: number;
  longitude: number;
  category?: string;
  distance?: string;
}

// 최근 검색 기록
// 기본 장소 정보에 'timestamp' 필드만 추가
export interface RecentSearchItem extends PlaceInfo {
  timestamp: number; // 저장된 시각
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
