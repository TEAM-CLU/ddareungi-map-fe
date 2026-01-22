import { LogoutResponse } from '@/features/auth/model/auth.types';
import {
  GetUserInfoResponse,
  UpdateUserResponse,
  UpdateUserPayload,
  DeleteUserResponse,
} from '@/features/auth/model/user.types';
import { formatAddress } from '@/shared/utils/address';
import { formatBirthDate } from '@/shared/utils/date';
import { CommonActions } from '@react-navigation/native';
import { UseMutateFunction } from '@tanstack/react-query';
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
  navigation: any;
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
  const [month, setMonth] = useState<number | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [gender, setGender] = useState<'M' | 'F' | undefined>(undefined);
  const [gu, setGu] = useState<string | null>(null);
  const [dong, setDong] = useState<string | null>(null);

  // 개인정보 동의 모달 상태
  const [isPrivacyConsentModalOpen, setIsPrivacyConsentModalOpen] =
    useState(false);
  const [isConsentRequiredAgreed, setIsConsentRequiredAgreed] = useState(false);
  const [isConsentOptionalAgreed, setIsConsentOptionalAgreed] = useState(false);
  const [consentedAt, setConsentedAt] = useState<string | null>(null);
  const [isAddressInputEnabled, setIsAddressInputEnabled] = useState(false);

  // 수정 여부
  const initialFormRef = useRef<{
    name: string;
    gender?: 'M' | 'F';
    birthDate: string;
    address: string;
    optionalAgreed: boolean;
  } | null>(null);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.data.name ?? '');
      setGender(userInfo.data.gender as 'M' | 'F');

      setIsConsentRequiredAgreed(true); // 필수 동의는 항상 true (회원가입시 완료)
      setIsConsentOptionalAgreed(userInfo.data.optionalAgreed ?? false);
      setIsAddressInputEnabled(userInfo.data.optionalAgreed ?? false);
      setConsentedAt(userInfo.data.consentedAt ?? null);

      if (userInfo.data.birthDate) {
        const [y, m, d] = userInfo.data.birthDate.split('-').map(Number);
        setYear(y);
        setMonth(m);
        setDay(d);
      }
      if (userInfo.data.address) {
        const parts = userInfo.data.address.split('-');
        if (parts.length >= 3) {
          setGu(parts[1]);
          setDong(parts[2]);
        }
      }

      if (!initialFormRef.current) {
        initialFormRef.current = {
          name: userInfo.data.name ?? '',
          gender: userInfo.data.gender as 'M' | 'F',
          birthDate: userInfo.data.birthDate ?? '',
          address: userInfo.data.address ?? '',
          optionalAgreed: userInfo.data.optionalAgreed ?? false,
        };
      }
    }
  }, [userInfo]);

  // 동의 모달에서 필수 동의 완료 시 주소 입력 활성화
  useEffect(() => {
    if (isConsentOptionalAgreed && !isPrivacyConsentModalOpen) {
      setIsAddressInputEnabled(true);
    }
  }, [isConsentOptionalAgreed, isPrivacyConsentModalOpen]);

  const formattedBirthDate = useMemo(() => {
    if (year && month && day) return formatBirthDate(year, month, day);
    return userInfo?.data.birthDate ?? '';
  }, [year, month, day]);

  const formattedAddress = useMemo(() => {
    if (gu && dong) return formatAddress(gu, dong);
    return userInfo?.data.address ?? '';
  }, [gu, dong]);

  const isValidName = name.trim().length > 0 && name.trim() !== '';
  const isValidGender = gender === 'M' || gender === 'F';
  const isValidBirthDate = !!formattedBirthDate;

  const isDirty = useMemo(() => {
    if (!initialFormRef.current) return false;

    const initialUserInfo = initialFormRef.current;

    return (
      initialUserInfo.name !== name ||
      initialUserInfo.gender !== gender ||
      initialUserInfo.birthDate !== formattedBirthDate ||
      initialUserInfo.address !== formattedAddress ||
      initialUserInfo.optionalAgreed !== isConsentOptionalAgreed
    );
  }, [
    name,
    gender,
    formattedBirthDate,
    formattedAddress,
    isConsentOptionalAgreed,
  ]);

  const isFormReady =
    isValidName && isValidGender && isValidBirthDate && isDirty;

  const handleSaveChangesPress = () => {
    if (!isFormReady) {
      Alert.alert('필수 항목을 입력해주세요.');
      return;
    }

    const updatedData: UpdateUserPayload = {
      name: name ?? userInfo?.data.name ?? '',
      gender: gender ?? userInfo?.data.gender ?? 'M',
      birthDate: formattedBirthDate ?? userInfo?.data.birthDate ?? '',
      address: formattedAddress ?? userInfo?.data.address ?? '',
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
        Alert.alert('오류', error.message);
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
                Alert.alert('오류', error.message);
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
    month,
    setMonth,
    day,
    setDay,

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
    isAddressInputEnabled,

    isFormReady,
    isValidName,

    handleSaveChangesPress,
    handleLogoutPress,
    handleDeleteAccountPress,
  };
};

export default useProfileEdit;
