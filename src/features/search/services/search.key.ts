// 쿼리 키 팩토리 (Query Key Factory)
// 키 관리를 한곳에서 하여 오타를 방지하고 캐시 제어를 쉽게 함
import { SearchOptions } from "../model/search.types";

export const placeKeys = {
  // 1. 가장 큰 대분류 이름표
  all: ['places'] as const,

  // 2. 검색어용 이름표 생성 함수
  // 사용법: placeKeys.keyword('강남') -> ['places', 'keyword', '강남'] 이 자동 생성됨
  keyword: (query: string, options?: SearchOptions) =>
    [...placeKeys.all, 'keyword', query, options] as const,

  // 3. 주소 검색용 이름표 생성 함수
  // 사용법: placeKeys.address('서울시...') -> ['places', 'address', '서울시...'] 생성됨
  address: (address: string) => [...placeKeys.all, 'address', address] as const,

  // 4. 역지오코딩용 이름표 생성 함수
  // 사용법: placeKeys.reverse(37.5, 127.0) -> ['places', 'reverse', 37.5, 127.0] 생성됨
  reverse: (lat: number | undefined, lon: number | undefined) =>
    [...placeKeys.all, 'reverse', lat, lon] as const,

  // 5. 최근 검색 기록
  recentSearch: ['places', 'recentSearch'] as const,
};