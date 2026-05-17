import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '@/app/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigateToLogin = () => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    );
  }
};
