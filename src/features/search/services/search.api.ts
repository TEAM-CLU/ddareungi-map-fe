import { KAKAO_REST_API_KEY } from '@env';
import {
  KakaoSearchPlace,
  KakaoSearchResponse,
  PlaceInfo,
  SearchOptions,
} from '../model/search.types';
import { SEARCH_CONSTANTS } from '../model/search.constants';
import { Alert } from 'react-native';

// Kakao API 헬퍼 객체
const kakaoApiHelper = {
  baseURL: SEARCH_CONSTANTS.KAKAO_BASE_URL,
  apiKey: KAKAO_REST_API_KEY || 'KAKAO_REST_API_KEY',

  // API 키 검증
  validateApiKey(): boolean {
    if (!this.apiKey || this.apiKey.startsWith('KAKAO_')) {
      Alert.alert(SEARCH_CONSTANTS.ERROR_MESSAGES.API_KEY_NOT_SET);
      return false;
    }
    return true;
  },

  // HTTP 요청 헬퍼
  async request(endpoint: string, params: URLSearchParams) {
    const url = `${this.baseURL}${endpoint}?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `${SEARCH_CONSTANTS.ERROR_MESSAGES.API_REQUEST_FAILED}: ${response.status}`,
      );
    }

    return response.json();
  },

  // 카카오 API 응답을 앱 내부 형식으로 변환
  transformToPlaceInfo(place: KakaoSearchPlace): PlaceInfo {
    return {
      id: place.id,
      name: place.place_name,
      address: place.address_name,
      roadAddress: place.road_address_name || undefined,
      latitude: parseFloat(place.y),
      longitude: parseFloat(place.x),
      category: place.category_group_name || undefined,
      distance: place.distance ? `${place.distance}m` : undefined,
    };
  },
};

// 키워드로 장소 검색 (자동완성)
export const searchPlacesByKeyword = async (
  query: string,
  options: SearchOptions = {},
): Promise<PlaceInfo[]> => {
  if (!kakaoApiHelper.validateApiKey()) {
    throw new Error(SEARCH_CONSTANTS.ERROR_MESSAGES.API_KEY_NOT_SET);
  }

  if (!query.trim()) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      query: query.trim(),
      page: (options.page || 1).toString(),
      size: (options.size || SEARCH_CONSTANTS.DEFAULT_PAGE_SIZE).toString(),
      sort: options.sort || 'accuracy',
    });

    // 중심점이 있으면 추가
    if (options.x && options.y) {
      params.append('x', options.x.toString());
      params.append('y', options.y.toString());
    }

    // 반경이 있으면 추가
    if (options.radius) {
      params.append('radius', options.radius.toString());
    }

    const data: KakaoSearchResponse = await kakaoApiHelper.request(
      '/keyword.json',
      params,
    );
    return data.documents.map(place =>
      kakaoApiHelper.transformToPlaceInfo(place),
    );
  } catch (error) {
    console.error('Kakao keyword search error:', error);
    throw error;
  }
};

// 주소로 좌표 검색
export const searchAddressCoordinates = async (
  address: string,
): Promise<PlaceInfo | null> => {
  if (!kakaoApiHelper.validateApiKey()) {
    throw new Error(SEARCH_CONSTANTS.ERROR_MESSAGES.API_KEY_NOT_SET);
  }

  try {
    const params = new URLSearchParams({
      query: address.trim(),
    });

    const data = await kakaoApiHelper.request('/search/address.json', params);
    if (!data.documents?.length) return null;

    const place = data.documents[0];
    return {
      id: `address_${Date.now()}`,
      name: place.address_name || place.road_address_name,
      address: place.address_name,
      roadAddress: place.road_address_name,
      latitude: parseFloat(place.y),
      longitude: parseFloat(place.x),
    };
  } catch (error) {
    console.error('Kakao address search error:', error);
    throw error;
  }
};

// 좌표로 주소 검색 (역지오코딩)
export const reverseGeocode = async (
  latitude: number,
  longitude: number,
): Promise<PlaceInfo | null> => {
  if (!kakaoApiHelper.validateApiKey()) {
    throw new Error(SEARCH_CONSTANTS.ERROR_MESSAGES.API_KEY_NOT_SET);
  }

  try {
    const params = new URLSearchParams({
      x: longitude.toString(),
      y: latitude.toString(),
      input_coord: 'WGS84',
    });

    const data = await kakaoApiHelper.request(
      '/geo/coord2address.json',
      params,
    );
    if (!data.documents?.length) return null;

    const { road_address, address } = data.documents[0];
    return {
      id: `currentLocation_${Date.now()}`,
      name: road_address?.building_name || address.address_name || '현재 위치',
      address: address.address_name,
      roadAddress: road_address?.address_name,
      latitude,
      longitude,
      category: '현재 위치',
    };
  } catch (error) {
    console.error('[Kakao] Reverse Geocode Error:', error);
    throw error;
  }
};
