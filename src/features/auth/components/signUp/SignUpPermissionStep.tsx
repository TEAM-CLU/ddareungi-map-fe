import React, { useState, useEffect, useRef } from 'react';
import { Platform, Alert, AppState, AppStateStatus } from 'react-native';
import RoundButton from '@/shared/components/button/RoundButton';

import { tw } from '@/shared/libs/tw-helper';
import { Text, View } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
  PermissionStatus,
  openSettings,
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';
import SquareButton from '@/shared/components/button/SquareButton';
import { PermissionItem } from '@/features/auth/model/common.types';
import { IconInfo, IconLocation } from '@/shared/components/icons';
import { handleCatch } from '@/shared/utils/errorHandler';

interface SignUpPermissionStepProps {
  setIsReadyToSignUp: React.Dispatch<React.SetStateAction<boolean>>;
}

const SignUpPermissionStep = ({
  setIsReadyToSignUp,
}: SignUpPermissionStepProps) => {
  const [permissions, setPermissions] = useState<PermissionItem[]>([
    {
      name: '위치(필수)',
      permission:
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      required: true,
      status: RESULTS.UNAVAILABLE,
      icon: <IconLocation />,
      description: '현위치 기반 대여소 검색 및 길찾기 기능 제공',
    },
    {
      name: '알림(선택)',
      permission: 'NOTIFICATIONS',
      required: false,
      status: RESULTS.UNAVAILABLE,
      icon: <IconInfo />,
      description: '주요 공지 알림 수신 및 마케팅 이벤트 홍보',
    },
  ]);

  const appState = useRef(AppState.currentState);

  const [hasRequestedPermissions, setHasRequestedPermissions] = useState(false);

  const canProceed = () => {
    const requiredPermissions = permissions.filter(p => p.required);
    return requiredPermissions.every(p => p.status === RESULTS.GRANTED);
  };

  const checkAllPermissions = async () => {
    try {
      const updatedPermissions = await Promise.all(
        permissions.map(async perm => {
          let status: PermissionStatus;

          if (perm.permission === 'NOTIFICATIONS') {
            try {
              const notificationStatus = await checkNotifications();
              status = notificationStatus.status;
            } catch (_) {
              status = RESULTS.UNAVAILABLE;
            }
          } else {
            status = await check(perm.permission as Permission);
          }

          return { ...perm, status };
        }),
      );
      setPermissions(updatedPermissions);
    } catch (error) {
      handleCatch(error, {
        mode: 'alert',
        title: '권한 확인 오류',
        message: '권한을 확인할 수 없습니다. 설정에서 권한을 확인해주세요.',
        buttons: [
          { text: '취소', style: 'cancel' },
          { text: '설정으로 이동', onPress: () => openSettings() },
        ],
      });
    }
  };

  const requestPermission = async (permissionItem: PermissionItem) => {
    try {
      let status: PermissionStatus;

      if (permissionItem.permission === 'NOTIFICATIONS') {
        try {
          const notificationResult = await requestNotifications([
            'alert',
            'badge',
            'sound',
          ]);
          status = notificationResult.status;
        } catch (_) {
          status = RESULTS.DENIED;
        }
      } else {
        status = await request(permissionItem.permission as Permission);
      }

      setPermissions(prev =>
        prev.map(p =>
          p.permission === permissionItem.permission ? { ...p, status } : p,
        ),
      );

      if (status === RESULTS.BLOCKED) {
        Alert.alert(
          '권한 차단됨',
          `${permissionItem.name} 권한이 차단되었습니다. 설정에서 권한을 허용해주세요.`,
          [
            { text: '취소', style: 'cancel' },
            { text: '설정으로 이동', onPress: () => openSettings() },
          ],
        );
      }
    } catch (error) {
      handleCatch(error, {
        mode: 'alert',
        title: '권한 요청 오류',
        message: '권한 요청 중 오류가 발생했습니다. 설정에서 권한을 확인해주세요.',
        buttons: [
          { text: '취소', style: 'cancel' },
          { text: '설정으로 이동', onPress: () => openSettings() },
        ],
      });
    }
  };

  const requestAllRequiredPermissions = async () => {
    const requiredPermissions = permissions.filter(p => p.required);

    for (const perm of requiredPermissions) {
      if (perm.status !== RESULTS.GRANTED) {
        await requestPermission(perm);
      }
    }

    setHasRequestedPermissions(true);

    // 권한 요청 후 상태 재확인
    await checkAllPermissions();

    // 필수 권한이 거부되거나 차단된 경우 안내
    const updatedRequiredPermissions = permissions.filter(p => p.required);
    const blockedOrDenied = updatedRequiredPermissions.find(
      p => p.status === RESULTS.BLOCKED || p.status === RESULTS.DENIED,
    );

    if (blockedOrDenied) {
      Alert.alert(
        '필수 권한 필요',
        '위치 권한은 따릉이맵의 필수 기능입니다. 설정에서 권한을 허용해주세요.',
        [
          { text: '취소', style: 'cancel' },
          { text: '설정으로 이동', onPress: () => openSettings() },
        ],
      );
    }
  };

  // 초기 권한 상태 확인
  useEffect(() => {
    checkAllPermissions();
  }, []);

  const handleCompleteSignUp = () => {
    if (!canProceed()) {
      Alert.alert(
        '권한 필요',
        '필수 권한을 모두 허용해야 회원가입을 완료할 수 있습니다.',
        [{ text: '확인' }],
      );
      return;
    }
    setIsReadyToSignUp(true);
  };

  // 설정에서 돌아오면 권한 상태 리프레시
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        checkAllPermissions(); // ← 여기서 권한 상태 리프레시!
      }
      appState.current = nextAppState;
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, []);

  const getStatusColor = (permission: PermissionItem) => {
    if (permission.status === RESULTS.GRANTED) {
      return tw('text-brand-primary');
    } else {
      return tw('text-error');
    }
  };

  const getStatusText = (status: PermissionStatus) => {
    switch (status) {
      case RESULTS.GRANTED:
        return '허용됨';
      case RESULTS.DENIED:
        return '거부됨';
      case RESULTS.BLOCKED:
        return '차단됨';
      case RESULTS.LIMITED:
        return '제한됨';
      case RESULTS.UNAVAILABLE:
        return '사용불가';
      default:
        return '미설정';
    }
  };

  const getBottomButtonProps = () => {
    if (!hasRequestedPermissions) {
      return {
        title: '필수 권한 허용',
        onPress: requestAllRequiredPermissions,
        disabled: false,
      };
    } else {
      return {
        title: '다음',
        onPress: handleCompleteSignUp,
        disabled: !canProceed(),
      };
    }
  };

  const bottomButtonProps = getBottomButtonProps();

  return (
    <View
      style={[
        tw('w-full flex-1 flex flex-col justify-between items-center'),
        { marginTop: 55 },
      ]}
    >
      <View style={[tw('flex flex-col w-full'), { gap: 3 }]}>
        <Text
          style={[
            tw('font-primary-700 text-on-surface-primary text-left'),
            { fontSize: 24 },
          ]}
        >
          따릉이맵을 이용하기 위해,
        </Text>
        <Text
          style={[
            tw('font-primary-500 text-on-surface-primary text-left'),
            { fontSize: 24 },
          ]}
        >
          권한 허용이 필요해요.
        </Text>
        <Text
          style={[
            tw('font-primary-500 text-on-surface-tertiary mt-4'),
            { fontSize: 13 },
          ]}
        >
          선택 권한은 추후 해당 기능을 사용할 때 허용이 필요합니다.
        </Text>
      </View>

      <View
        style={[tw('flex-col w-full flex'), { gap: 25, marginBottom: 100 }]}
      >
        {permissions.map((permission, index) => (
          <View key={index} style={[tw('flex flex-row w-full'), { gap: 23 }]}>
            {/* 아이콘을 최상단에 고정 */}
            <View style={tw('items-center justify-start')}>
              {permission.icon}
            </View>

            <View style={[tw('flex flex-col items-start flex-1'), { gap: 8 }]}>
              <View
                style={tw('flex flex-row items-center justify-between w-full')}
              >
                <Text
                  style={[
                    tw('font-primary-700 text-on-surface-primary'),
                    { fontSize: 13 },
                  ]}
                >
                  {permission.name}
                </Text>
                <Text
                  style={[
                    tw('font-primary-500 text-xs'),
                    getStatusColor(permission),
                  ]}
                >
                  {getStatusText(permission.status)}
                </Text>
              </View>
              <Text
                style={[
                  tw('font-primary-500 text-on-surface-primary'),
                  { fontSize: 13 },
                ]}
              >
                {permission.description}
              </Text>
              {/* 선택권한만 개별 허용하기 버튼 표시 */}
              {!permission.required &&
                permission.status !== RESULTS.GRANTED && (
                  <RoundButton
                    title="허용하기"
                    onPress={() => requestPermission(permission)}
                    preset="sm"
                  />
                )}
            </View>
          </View>
        ))}
      </View>

      <SquareButton
        title={bottomButtonProps.title}
        onPress={bottomButtonProps.onPress}
        disabled={bottomButtonProps.disabled}
      />
    </View>
  );
};

export default SignUpPermissionStep;
