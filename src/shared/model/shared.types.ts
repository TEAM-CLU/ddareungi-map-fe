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

/**
 * ModalState
 *
 * - "생성"은 컴포넌트에서 하고
 * - 이 스토어는 상태만 보관한다.
 */


export type PrevScreenForFeatureBranch = 'login' | 'mypage';


export interface Coordinate {
  lat: number 
  lng: number 
}