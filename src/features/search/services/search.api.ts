import { KAKAO_REST_API_KEY } from '@env';
import {
  KakaoSearchPlace,
  KakaoSearchResponse,
  PlaceInfo,
  SearchOptions,
} from '../model/search.types';
import {
  KAKAO_BASE_URL,
} from '../model/search.constants';
import axios from 'axios';
import { commonErrorInterceptor } from '@/shared/services/axiosConfig';

// ------------------------------------------------------------------
// 1. Axios 클라이언트 설정
// ------------------------------------------------------------------
const kakaoClient = axios.create({
  baseURL: KAKAO_BASE_URL,
  timeout: 5000, // 5초 동안 응답 없으면 타임아웃
});

// [요청 인터셉터] API 키 주입
kakaoClient.interceptors.request.use(
  config => {
    if (!KAKAO_REST_API_KEY || KAKAO_REST_API_KEY.startsWith('KAKAO_')) {
      return Promise.reject(new Error('카카오 API 키가 설정되지 않았습니다.'));
    }
    config.headers.Authorization = `KakaoAK ${KAKAO_REST_API_KEY}`;
    return config;
  },
  error => Promise.reject(error),
);

// [응답 인터셉터] 서버에서 받은 결과에 에러 있는지 먼저 검사
commonErrorInterceptor(kakaoClient);

// ------------------------------------------------------------------
// 2. 데이터 변환 헬퍼 (순수 함수)
// ------------------------------------------------------------------

// 카카오 API 응답을 앱 내부 형식으로 변환
const transformToPlaceInfo = (place: KakaoSearchPlace): PlaceInfo => ({
  id: place.id,
  name: place.place_name,
  address: place.address_name,
  roadAddress: place.road_address_name || undefined,
  latitude: parseFloat(place.y),
  longitude: parseFloat(place.x),
  category: place.category_group_name || undefined,
  distance: place.distance ? `${place.distance}m` : undefined,
});

// ------------------------------------------------------------------
// 3. API 함수들 (try-catch 제거 -> 인터셉터가 처리함)
// ------------------------------------------------------------------

/**
 * 키워드로 장소 검색 (자동완성)
 */
export const searchPlacesByKeyword = async (
  query: string,
  options: SearchOptions = {},
  signal?: AbortSignal,
): Promise<PlaceInfo[]> => {
  if (!query.trim()) return [];
  const { data } = await kakaoClient.get<KakaoSearchResponse>(
    '/search/keyword.json',
    {
      // 객체({ key: value })를 넣으면 Axios가 알아서 URL 뒤에 붙여줌
      // 객체로 넘기면 알아서 '?query=강남&page=1' 로 변환됨
      params: {
        query: query.trim(),
        page: options.page || 1,
        size: options.size || 15,
        sort: options.sort || 'accuracy',
        // 옵션이 있을 때만 파라미터에 추가
        ...(options.x && options.y && { x: options.x, y: options.y }),
        ...(options.radius && { radius: options.radius }),
      },
      signal,
    },
  );
  return data.documents.map(transformToPlaceInfo);
};

/**
 * 주소로 좌표 검색
 */
export const searchAddressCoordinates = async (
  address: string,
  signal?: AbortSignal,
): Promise<PlaceInfo | null> => {
  if (!address.trim()) return null;

  const { data } = await kakaoClient.get('/search/address.json', {
    params: { query: address.trim() },
    signal,
  });

  if (!data.documents?.length) return null;

  const place = data.documents[0];
  return {
    // 주소 검색은 ID가 없으므로 고유 ID 생성
    id: `address_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: place.address_name || place.road_address_name,
    address: place.address_name,
    roadAddress: place.road_address_name,
    latitude: parseFloat(place.y),
    longitude: parseFloat(place.x),
  };
};

/**
 * 좌표로 주소 검색 (역지오코딩)
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<PlaceInfo | null> => {
  const { data } = await kakaoClient.get('/geo/coord2address.json', {
    params: {
      x: longitude,
      y: latitude,
      input_coord: 'WGS84',
    },
    signal,
  });

  if (!data.documents?.length) return null;

  const { road_address, address } = data.documents[0];
  return {
    id: `current_${Date.now()}`,
    name: road_address?.building_name || address.address_name || '현재 위치',
    address: address.address_name,
    roadAddress: road_address?.address_name,
    latitude,
    longitude,
    category: '현재 위치',
  };
};
