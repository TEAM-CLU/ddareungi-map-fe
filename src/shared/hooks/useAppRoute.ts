import { RootStackParamList } from '@/app/types';
import { RouteProp, useRoute } from '@react-navigation/native';

export const useAppRoute = <T extends keyof RootStackParamList>() =>
  useRoute<RouteProp<RootStackParamList, T>>();
