import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import RoundButton from '@/shared/components/button/RoundButton';
import IconAudio from '@/shared/components/icons/IconAudio';
import IconInfo from '@/shared/components/icons/IconInfo';
import IconLocation from '@/shared/components/icons/IconLocation';
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
} from 'react-native-permissions';

interface SignUpPermissionStepProps {
  setIsReadyToSignUp: React.Dispatch<React.SetStateAction<boolean>>;
}

interface PermissionItem {
  name: string;
  permission: Permission;
  required: boolean;
  status: PermissionStatus;
  icon: React.ReactNode;
  description: string;
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
      name: '오디오(필수)',
      permission:
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.SPEECH_RECOGNITION
          : PERMISSIONS.ANDROID.RECORD_AUDIO, // 올바른 권한으로 수정
      required: true,
      status: RESULTS.UNAVAILABLE,
      icon: <IconAudio />,
      description: '네비게이션 음성 안내 기능 제공',
    },
    {
      name: '알림(선택)',
      permission:
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.MICROPHONE // 대체 권한으로 수정
          : PERMISSIONS.ANDROID.CAMERA, // 대체 권한으로 수정
      required: false,
      status: RESULTS.UNAVAILABLE,
      icon: <IconInfo />,
      description: '주요 공지 알림 수신 및 마케팅 이벤트 홍보',
    },
  ]);

  const [hasRequestedPermissions, setHasRequestedPermissions] = useState(false); // 새로운 상태 추가

  // 초기 권한 상태 확인
  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    try {
      const updatedPermissions = await Promise.all(
        permissions.map(async perm => {
          const status = await check(perm.permission);
          return { ...perm, status };
        }),
      );
      setPermissions(updatedPermissions);
    } catch (error) {
      console.error('권한 확인 실패:', error);
    }
  };

  const requestPermission = async (permissionItem: PermissionItem) => {
    try {
      const status = await request(permissionItem.permission);

      setPermissions(prev =>
        prev.map(p =>
          p.permission === permissionItem.permission ? { ...p, status } : p,
        ),
      );
    } catch (error) {
      console.error('권한 요청 실패:', error);
    }
  };

  const requestAllRequiredPermissions = async () => {
    const requiredPermissions = permissions.filter(p => p.required);

    for (const perm of requiredPermissions) {
      if (perm.status !== RESULTS.GRANTED) {
        await requestPermission(perm);
      }
    }

    setHasRequestedPermissions(true); // 권한 요청 완료 표시
  };

  const canProceed = () => {
    const requiredPermissions = permissions.filter(p => p.required);
    return requiredPermissions.every(p => p.status === RESULTS.GRANTED);
  };

  const handleComplete = () => {
    setIsReadyToSignUp(true);
  };

  const getStatusColor = (permission: PermissionItem) => {
    if (permission.status === RESULTS.GRANTED) {
      return tw('text-success');
    } else if (permission.required) {
      return tw('text-error');
    } else {
      return tw('text-on-surface-tertiary');
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
      default:
        return '미설정';
    }
  };

  // 버튼 상태에 따른 제목과 핸들러 결정
  const getBottomButtonProps = () => {
    if (!hasRequestedPermissions) {
      return {
        title: '필수 권한 허용',
        onPress: requestAllRequiredPermissions,
        disabled: false,
      };
    } else {
      return {
        title: '회원가입 완료',
        onPress: handleComplete,
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
        style={[tw('flex-col w-full flex'), { gap: 19, marginBottom: 100 }]}
      >
        {permissions.map((permission, index) => (
          <View
            key={index}
            style={[tw('flex flex-row w-full items-center'), { gap: 23 }]}
          >
            {permission.icon}
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
              {permission.status !== RESULTS.GRANTED && (
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

      <RoundButton
        title={bottomButtonProps.title} // 동적으로 변경
        onPress={bottomButtonProps.onPress} // 동적으로 변경
        preset="lg"
        disabled={bottomButtonProps.disabled} // 동적으로 변경
      />
    </View>
  );
};

export default SignUpPermissionStep;
