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
