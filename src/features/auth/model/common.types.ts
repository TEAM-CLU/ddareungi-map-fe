import { Permission, PermissionStatus } from 'react-native-permissions';

// 권한 타입
export interface PermissionItem {
  name: string;
  permission: Permission | 'NOTIFICATIONS';
  required: boolean;
  status: PermissionStatus;
  icon: React.ReactNode;
  description: string;
}

// 계정 찾기 / 비밀번호 재설정 구분용 타입
export type AccountFeatureType = 'findAccount' | 'resetPwd' | null;
