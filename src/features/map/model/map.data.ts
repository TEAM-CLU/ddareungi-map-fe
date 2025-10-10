import { Platform } from 'react-native';
import { PERMISSIONS, Permission } from 'react-native-permissions';

// 퍼미션
export const permission: Permission = Platform.select({
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
}) as Permission;
