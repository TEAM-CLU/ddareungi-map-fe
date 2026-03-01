import { RootStackParamList } from '@/app/types';
import { LogoutResponse } from '@/features/auth/model/auth.types';
import {
  GetUserInfoResponse,
  UpdateUserResponse,
  UpdateUserPayload,
  DeleteUserResponse,
} from '@/features/auth/model/user.types';
import { formatBirthYear } from '@/shared/utils/date';
import { formatAddress } from '@/shared/utils/formatAddress';
import { CommonActions } from '@react-navigation/native';
import { UseMutateFunction } from '@tanstack/react-query';
import { StackNavigationProp } from 'node_modules/@react-navigation/stack/lib/typescript/src/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

interface UseProfileEditParams {
  userInfo: GetUserInfoResponse;
  updateUser: UseMutateFunction<
    UpdateUserResponse,
    Error,
    UpdateUserPayload,
    unknown
  >;
  logout: UseMutateFunction<LogoutResponse, Error, void, unknown>;
  deleteUser: UseMutateFunction<DeleteUserResponse, Error, void, unknown>;
  navigation: StackNavigationProp<RootStackParamList>;
}

export const useProfileEdit = ({
  userInfo,
  updateUser,
  logout,
  deleteUser,
  navigation,
}: UseProfileEditParams) => {
  const [name, setName] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [gender, setGender] = useState<'M' | 'F' | undefined>(undefined);
  const [gu, setGu] = useState<string | null>(null);
  const [dong, setDong] = useState<string | null>(null);

  // 개인정보 동의 모달 상태
  const [isPrivacyConsentModalOpen, setIsPrivacyConsentModalOpen] =
    useState(false);
  const [isConsentRequiredAgreed, setIsConsentRequiredAgreed] = useState(false);
  const [isConsentOptionalAgreed, setIsConsentOptionalAgreed] = useState(false);
  const [consentedAt, setConsentedAt] = useState<string | null>(null);

  // 수정 여부
  const initialFormRef = useRef<{
    name: string;
    gender: 'M' | 'F' | null;
    birthYear: string | null;
    address: string | null;
    optionalAgreed: boolean;
  } | null>(null);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.data.name ?? '');
      setGender((userInfo.data.gender as 'M' | 'F' | null) ?? undefined);

      setIsConsentRequiredAgreed(true); // 필수 동의는 항상 true (회원가입시 완료)
      setIsConsentOptionalAgreed(userInfo.data.optionalAgreed ?? false);
      setConsentedAt(userInfo.data.consentedAt ?? null);

      const parsedBirthYear = userInfo.data.birthYear
        ? Number(userInfo.data.birthYear)
        : null;
      if (parsedBirthYear && Number.isFinite(parsedBirthYear)) {
        setYear(parsedBirthYear);
      } else {
        setYear(null);
      }
      if (userInfo.data.address) {
        const parts = userInfo.data.address.split('-');
        if (parts.length >= 3) {
          setGu(parts[1]);
          setDong(parts[2]);
        } else {
          setGu(null);
          setDong(null);
        }
      } else {
        setGu(null);
        setDong(null);
      }

      if (!initialFormRef.current) {
        initialFormRef.current = {
          name: userInfo.data.name ?? '',
          gender: userInfo.data.gender ?? null,
          birthYear: userInfo.data.birthYear ?? null,
          address: userInfo.data.address ?? null,
          optionalAgreed: userInfo.data.optionalAgreed ?? false,
        };
      }
    }
  }, [userInfo]);

  const formattedBirthYear = useMemo(
    () => (year ? formatBirthYear(year) : null),
    [year],
  );
  const formattedAddress = useMemo(() => {
    if (gu && dong) return formatAddress(gu, dong);
    return null;
  }, [gu, dong]);

  const isValidName = name.trim().length > 0 && name.trim() !== '';
  const isValidOptional =
    !isConsentOptionalAgreed ||
    ((gender === 'M' || gender === 'F') &&
      !!formattedBirthYear &&
      !!formattedAddress);

  const isDirty = useMemo(() => {
    if (!initialFormRef.current) return false;

    const initialUserInfo = initialFormRef.current;

    return (
      initialUserInfo.name !== name ||
      initialUserInfo.gender !== (isConsentOptionalAgreed ? (gender ?? null) : null) ||
      initialUserInfo.birthYear !==
        (isConsentOptionalAgreed ? formattedBirthYear : null) ||
      initialUserInfo.address !==
        (isConsentOptionalAgreed ? formattedAddress : null) ||
      initialUserInfo.optionalAgreed !== isConsentOptionalAgreed
    );
  }, [name, gender, formattedBirthYear, formattedAddress, isConsentOptionalAgreed]);

  const isFormReady = isValidName && isValidOptional && isDirty;

  const handleSaveChangesPress = () => {
    if (!isFormReady) {
      return;
    }

    const updatedData: UpdateUserPayload = {
      name: name ?? userInfo?.data.name ?? '',
      gender: isConsentOptionalAgreed ? (gender ?? null) : null,
      birthYear: isConsentOptionalAgreed ? formattedBirthYear : null,
      address: isConsentOptionalAgreed ? formattedAddress : null,
      requiredAgreed: true, // 필수 동의는 항상 true
      optionalAgreed: isConsentOptionalAgreed,
      consentedAt:
        consentedAt ?? userInfo?.data.consentedAt ?? new Date().toISOString(),
    };

    updateUser(updatedData, {
      onSuccess: data => {
        Alert.alert('알림', data.message);
      },
      onError: error => {
        Alert.alert('오류', "정보 수정에 실패했습니다. ");
      },
    });
  };

  const handleLogoutPress = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          style: 'destructive',
          onPress: () => {
            logout(undefined, {
              onSettled: () => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  }),
                );
              },
            });
          },
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  const handleDeleteAccountPress = () => {
    Alert.alert(
      '회원탈퇴',
      '정말 회원탈퇴 하시겠어요? 탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          style: 'destructive',
          onPress: () =>
            deleteUser(undefined, {
              onSuccess: data => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  }),
                );
                Alert.alert('알림', data.message);
              },
              onError: error => {
                Alert.alert('오류', "회원탈퇴에 실패했습니다. " );
                navigation.navigate('Login');
              },
            }),
        },
      ],
      { cancelable: true },
    );
  };

  return {
    name,
    setName,
    year,
    setYear,

    gender,
    setGender,
    gu,
    setGu,
    dong,
    setDong,

    isPrivacyConsentModalOpen,
    setIsPrivacyConsentModalOpen,
    isConsentRequiredAgreed,
    setIsConsentRequiredAgreed,
    isConsentOptionalAgreed,
    setIsConsentOptionalAgreed,
    setConsentedAt,

    isFormReady,
    isValidName,

    handleSaveChangesPress,
    handleLogoutPress,
    handleDeleteAccountPress,
  };
};

export default useProfileEdit;
