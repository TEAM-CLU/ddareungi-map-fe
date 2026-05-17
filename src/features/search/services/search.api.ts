import {
  KakaoSearchPlace,
  KakaoSearchResponse,
  PlaceInfo,
  SearchOptions,
} from '../model/search.types';
import axios from 'axios';
import { commonErrorInterceptor } from '@/config/axiosConfig';
import { SERVER_URL } from '@/shared/model/shared.constants';

// ------------------------------------------------------------------
// 1. Axios 클라이언트 설정
// ------------------------------------------------------------------
const serverClient = axios.create({
  baseURL: SERVER_URL,
  timeout: 5000, // 5초 동안 응답 없으면 타임아웃
});

// [요청 인터셉터] 서버 공통 설정
serverClient.interceptors.request.use(
  config => config,
  error => Promise.reject(error),
);

// [응답 인터셉터 1] 에러 포맷 정규화
serverClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.data?.msg) {
      error.response.data.message = error.response.data.msg;
    }
    return Promise.reject(error);
  },
);

// [응답 인터셉터 2] 공통 에러 처리
commonErrorInterceptor(serverClient);

// ------------------------------------------------------------------
// 2. 데이터 변환 헬퍼
// ------------------------------------------------------------------

const formatDistance = (meters: string): string => {
  const m = parseFloat(meters);
  if (isNaN(m)) return `${meters}m`;
  if (m >= 1000) {
    const km = m / 1000;
    return `${km % 1 === 0 ? km.toFixed(0) : km.toFixed(1)}km`;
  }
  return `${Math.round(m)}m`;
};

// 카카오 API 응답을 앱 내부 형식으로 변환
const transformToPlaceInfo = (place: KakaoSearchPlace): PlaceInfo => ({
  placeId: place.id,
  name: place.place_name,
  address: place.address_name,
  roadAddress: place.road_address_name || undefined,
  latitude: parseFloat(place.y),
  longitude: parseFloat(place.x),
  category: place.category_group_name || undefined,
  distance: place.distance ? formatDistance(place.distance) : undefined,
});

// ------------------------------------------------------------------
// 3. API 함수
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
  const { data } = await serverClient.get<KakaoSearchResponse>(
    '/locations/keyword',
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
  return data.data.documents.map(transformToPlaceInfo);
};

/**
 * 주소로 좌표 검색
 */
export const searchAddressCoordinates = async (
  address: string,
  signal?: AbortSignal,
): Promise<PlaceInfo | null> => {
  if (!address.trim()) return null;

  const { data } = await serverClient.get('/locations/address', {
    params: { query: address.trim() },
    signal,
  });

  if (!data.data.documents?.length) return null;

  const place = data.data.documents[0];
  return {
    // 주소 검색은 ID가 없으므로 고유 ID 생성
    placeId: `address_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: place.address_name || place.road_address?.address_name,
    address: place.address_name,
    roadAddress: place.road_address?.address_name,
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
  const { data } = await serverClient.get('/locations/coord2address', {
    params: {
      x: longitude,
      y: latitude,
      input_coord: 'WGS84',
    },
    signal,
  });

  if (!data.data.documents?.length) return null;

  const { road_address, address } = data.data.documents[0];
  return {
    placeId: `current_${Date.now()}`,
    name: road_address?.building_name || address.address_name || '현재 위치',
    address: address.address_name,
    roadAddress: road_address?.address_name,
    latitude,
    longitude,
    category: '현재 위치',
  };
};
