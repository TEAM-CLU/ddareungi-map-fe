import { RootStackParamList } from '@/app/types';
import { RefObject } from 'react';
import { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';
import WebView from 'react-native-webview';
import { GetUserInfoResponse } from '@/features/auth/model/user.types';

export interface WebViewRefContextValue {
  webViewRef: RefObject<WebView | null>;
}

type RNStyle = StyleProp<ViewStyle | TextStyle | ImageStyle>;
export type TW = (classNames: string) => RNStyle;

export type InputType =
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'decimal'
  | 'tel'
  | 'url'
  | 'search'
  | 'username'
  | 'name';

export interface AuthContextType {
  accessToken: string | null;
  isAuthLoading: boolean;
  setToken: (token: string) => Promise<void>;
  getToken: () => Promise<string | null>;
  removeToken: () => Promise<void>;
  hasToken: () => boolean;
}

export interface UserContextType {
  user: GetUserInfoResponse | null;
  setUser: (user: GetUserInfoResponse) => Promise<void>;
  updateUser: (data: Partial<GetUserInfoResponse>) => Promise<void>;
  removeUser: () => Promise<void>;
}

export type FooterRoutes = keyof RootStackParamList;

// measure.ts
export type TransportationType = 'walking' | 'biking';
export type Gender = 'M' | 'F' | undefined;

// -----------------------------
// 즐겨찾기 관련 타입
// -----------------------------
export interface BookmarkItem {
  id: string; // placeId
  name: string; // 장소명
  alias?: string; // 별칭
  color?: string; // 마커/뱃지 색상

  address: string;
  category: string;
  latitude: number;
  longitude: number;

  createdAt: number; // 정렬용
}

export interface UseBookmarkOptions {
  isMapReady: boolean;
  mapReadyVersion: number;
}
/**
 * ModalState
 *
 * - "생성"은 컴포넌트에서 하고
 * - 이 스토어는 상태만 보관한다.
 */

export interface ModalState {
  /* -----------------------------
          모달 오픈 / 닫힘 상태
  ------------------------------ */
  showPlaceDetailModal: boolean;
  showSelectedRouteDetailModal: boolean;
  showNearByStationModal: boolean;
  showStationDetailModal: boolean;
  showRouteRecommendModal: boolean;
  showBookmarkModal: boolean;
  showNavigationDetailModal: boolean;
  showNavigationStartModal: boolean;
  showNavigationEndModal: boolean;
  showNavigationFinishModal: boolean;

  /* -----------------------------
                Actions
  ------------------------------ */

  /** 각 모달의 show/hide 토글 함수들 */
  setShowPlaceDetailModal: (isVisible: boolean) => void;
  setShowSelectedRouteDetailModal: (isVisible: boolean) => void;
  setShowNearByStationModal: (isVisible: boolean) => void;
  setShowStationDetailModal: (isVisible: boolean) => void;
  setShowRouteRecommendModal: (isVisible: boolean) => void;
  setShowBookmarkModal: (isVisible: boolean) => void;
  setShowNavigationDetailModal: (isVisible: boolean) => void;
  setShowNavigationStartModal: (isVisible: boolean) => void;
  setShowNavigationEndModal: (isVisible: boolean) => void;
  setShowNavigationFinishModal: (isVisible: boolean) => void;
}

export type PrevScreenForFeatureBranch = 'login' | 'mypage';
