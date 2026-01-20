import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';

export const useBlockBackNavigation = (isBackBlocked: boolean) => {
  const { navigation } = useAppNavigation();

  useEffect(() => {
    if (!isBackBlocked) return;

    const removeBeforeRemoveListener = navigation.addListener(
      'beforeRemove',
      e => {
        const actionType = e?.data?.action?.type;
        if (
          actionType === 'RESET' ||
          actionType === 'REPLACE' ||
          actionType === 'NAVIGATE'
        ) {
          return;
        }

        e.preventDefault();
      },
    );

    const backHandlerSubscription =
      Platform.OS === 'android'
        ? BackHandler.addEventListener('hardwareBackPress', () => true)
        : null;

    return () => {
      removeBeforeRemoveListener();
      backHandlerSubscription?.remove?.();
    };
  }, [isBackBlocked, navigation]);
};
