import { Coordinates } from '@/features/map/model/map.types';
import WebView from 'react-native-webview';

// useMyLocation hook 내부 상태 타입
export interface UseMyLocationProps {
  webRef: React.RefObject<WebView | null>;
  setMyPosition: React.Dispatch<React.SetStateAction<Coordinates | undefined>>;
}
