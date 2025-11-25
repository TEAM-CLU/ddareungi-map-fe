import { RootStackParamList } from '@/app/types';
import { GetUserInfoResponse } from '@/features/auth/model/auth.types';
import { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

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
  type: 'place' | 'station';
  id: string; // placeId or stationNumber
  name: string; // 장소명 or 대여소명
  alias?: string; // 별칭
  color?: string; // 색상

  address?: string;
  latitude: number;
  longitude: number;
  
  createdAt: number; // 정렬용
}