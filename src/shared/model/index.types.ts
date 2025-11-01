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
