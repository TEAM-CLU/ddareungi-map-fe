import { RootStackParamList } from '@/app/types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RefObject } from 'react';
import { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';
import WebView from 'react-native-webview';
import Modal from 'react-native-modal';
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
 * - "생성"은 컴포넌트 / 컨트롤러에서 하고
 * - 이 스토어는 단지 ref와 상태를 "보관"만 한다.
 */

export interface ModalState {
  /* -----------------------------
          모달 Ref 저장소
     - 실제 생성은 useMapController에서 하고
     - 여기는 단지 "참조"를 들고 있음
  ------------------------------ */

  placeDetailModalRef: React.RefObject<BottomSheetModal | null> | null;
  selectedRouteDetailModalRef: React.RefObject<BottomSheetModal | null> | null;
  nearbyStationModalRef: React.RefObject<BottomSheetModal | null> | null;
  stationDetailModalRef: React.RefObject<BottomSheetModal | null> | null;
  routeRecommendModalRef: React.RefObject<BottomSheetModal | null> | null;
  bookmarkModalRef: React.RefObject<BottomSheetModal | null> | null;
  navigationDetailModalRef: React.RefObject<BottomSheetModal | null> | null;
  navigationStartModalRef: React.RefObject<Modal | null> | null;
  navigationEndModalRef: React.RefObject<Modal | null> | null;
  navigationFinishModalRef: React.RefObject<Modal | null> | null;
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

  /**
   * 모달 ref들을 한 번에 저장하기 위한 헬퍼
   * - useMapController에서 useRef로 생성 후 여기로 넘김
   */
  setModalRefs: (
    modalRefs: Partial<
      Pick<
        ModalState,
        | 'placeDetailModalRef'
        | 'selectedRouteDetailModalRef'
        | 'nearbyStationModalRef'
        | 'stationDetailModalRef'
        | 'routeRecommendModalRef'
        | 'bookmarkModalRef'
        | 'navigationDetailModalRef'
        | 'navigationStartModalRef'
        | 'navigationEndModalRef'
        | 'navigationFinishModalRef'
      >
    >,
  ) => void;

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
