import { RootStackParamList } from '@/app/types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export const useAppNavigation = <
  T extends keyof RootStackParamList | undefined = undefined,
>() => {
  const navigation =
    useNavigation<
      T extends keyof RootStackParamList
        ? StackNavigationProp<RootStackParamList, T>
        : StackNavigationProp<RootStackParamList>
    >();

  return { navigation };
};
