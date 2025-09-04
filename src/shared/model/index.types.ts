import { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

type RNStyle = StyleProp<ViewStyle | TextStyle | ImageStyle>;
export type TW = (classNames: string) => RNStyle;
