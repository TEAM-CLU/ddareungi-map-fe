import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import BackButton from '@/shared/components/button/BackButton';
import { formatBirthDate } from '@/shared/utils/date';
import { formatAddress } from '@/shared/utils/address';
import {
  useDeleteUserMutation,
  useUpdateUserInfoMutation,
  useUserInfoQuery,
} from '@/features/auth/services/user.queries';
import { UpdateUserPayload } from '@/features/auth/model/auth.types';
import SimpleLoading from '@/shared/components/SimpleLoading';
import Input from '@/shared/components/Input/Input';
import BirthDateInput from '@/shared/components/Input/BirthDateInput';
import GenderButton from '@/shared/components/button/GenderButton';
import AddressInput from '@/shared/components/Input/AddressInput';
import SquareButton from '@/shared/components/button/SquareButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogoutMutation } from '@/features/auth/services/auth.queries';
import PrivacyConsentModal from '@/features/auth/components/PrivacyConsentModal';
import { CommonActions } from '@react-navigation/native';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import RoundButton from '@/shared/components/button/RoundButton';

const ProfileEditor = ({ onBack }: { onBack: () => void }) => {
  const { data: user, isPending } = useUserInfoQuery();
  const { mutate: updateUser } = useUpdateUserInfoMutation();
  const { mutate: logout } = useLogoutMutation();
  const { mutate: deleteUser } = useDeleteUserMutation();

  const { navigation } = useAppNavigation();

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
    if (user) {
      setName(user.data.name ?? '');
      setGender(user.data.gender as 'M' | 'F');

      setIsConsentRequiredAgreed(true); // 필수 동의는 항상 true (회원가입시 완료)
      setIsConsentOptionalAgreed(user.data.optionalAgreed ?? false);
      setIsAddressInputEnabled(user.data.optionalAgreed ?? false);
      setConsentedAt(user.data.consentedAt ?? null);

      if (user.data.birthDate) {
        const [y, m, d] = user.data.birthDate.split('-').map(Number);
        setYear(y);
        setMonth(m);
        setDay(d);
      }
      if (user.data.address) {
        const parts = user.data.address.split('-');
        if (parts.length >= 3) {
          setGu(parts[1]);
          setDong(parts[2]);
        }
      }

      if (!initialFormRef.current) {
        initialFormRef.current = {
          name: user.data.name ?? '',
          gender: user.data.gender as 'M' | 'F',
          birthDate: user.data.birthDate ?? '',
          address: user.data.address ?? '',
          optionalAgreed: user.data.optionalAgreed ?? false,
        };
      }
    }
  }, [user]);

  // 동의 모달에서 필수 동의 완료 시 주소 입력 활성화
  useEffect(() => {
    if (isConsentOptionalAgreed && !isPrivacyConsentModalOpen) {
      setIsAddressInputEnabled(true);
    }
  }, [isConsentOptionalAgreed, isPrivacyConsentModalOpen]);

  const formattedBirthDate = useMemo(() => {
    if (year && month && day) return formatBirthDate(year, month, day);
    return user?.data.birthDate ?? '';
  }, [year, month, day]);

  const formattedAddress = useMemo(() => {
    if (gu && dong) return formatAddress(gu, dong);
    return user?.data.address ?? '';
  }, [gu, dong]);

  const isValidName = name.trim().length > 0 && name.trim() !== '';
  const isValidGender = gender === 'M' || gender === 'F';
  const isValidBirthDate = !!formattedBirthDate;

  const isDirty = useMemo(() => {
    if (!initialFormRef.current) return false;

    const initial = initialFormRef.current;

    return (
      initial.name !== name ||
      initial.gender !== gender ||
      initial.birthDate !== formattedBirthDate ||
      initial.address !== formattedAddress ||
      initial.optionalAgreed !== isConsentOptionalAgreed
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

  const handleSavePress = () => {
    if (!isFormReady) {
      Alert.alert('필수 항목을 입력해주세요.');
      return;
    }

    const updatedData: UpdateUserPayload = {
      name: name ?? user?.data.name ?? '',
      gender: gender ?? user?.data.gender ?? 'M',
      birthDate: formattedBirthDate ?? user?.data.birthDate ?? '',
      address: formattedAddress ?? user?.data.address ?? '',
      requiredAgreed: true, // 필수 동의는 항상 true
      optionalAgreed: isConsentOptionalAgreed,
      consentedAt:
        consentedAt ?? user?.data.consentedAt ?? new Date().toISOString(),
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

  const handleWithdrawPress = () => {
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

  if (isPending) return <SimpleLoading title="" />;

  return (
    <SafeAreaView style={tw('flex-1 bg-surface-secondary pt-6')}>
      <View style={tw('flex-row items-center px-5 pb-20')}>
        <BackButton type="custom" iconColor="brand" onPress={onBack} />
        <Text
          style={tw('text-xl font-primary-700 text-on-surface-primary ml-4')}
        >
          내 정보 수정
        </Text>
      </View>

      <View style={[tw('flex-1 px-6 justify-between')]}>
        <View
          style={[tw('flex flex-col w-full'), { gap: 20, marginBottom: 100 }]}
        >
          {/* 이름 */}
          <View
            style={[tw('flex flex-col w-full justify-center'), { gap: 10 }]}
          >
            <Text
              style={[
                tw('font-primary-600 text-on-surface-label-input text-left'),
                { fontSize: 15 },
              ]}
            >
              이름
            </Text>
            <Input
              type="text"
              placeholder="이름을 입력하세요."
              value={name}
              onChangeText={setName}
              isValid={isValidName}
            />
          </View>

          {/* 생년월일 */}
          <View
            style={[tw('flex flex-col w-full justify-center'), { gap: 10 }]}
          >
            <Text
              style={[
                tw('font-primary-600 text-on-surface-label-input text-left'),
                { fontSize: 15 },
              ]}
            >
              생년월일
            </Text>
            <BirthDateInput
              year={year}
              month={month}
              day={day}
              setYear={setYear}
              setMonth={setMonth}
              setDay={setDay}
            />
          </View>

          {/* 성별 */}
          <View
            style={[tw('flex flex-col w-full justify-center'), { gap: 10 }]}
          >
            <Text
              style={[
                tw('font-primary-600 text-on-surface-label-input text-left'),
                { fontSize: 15 },
              ]}
            >
              성별
            </Text>
            <View
              style={[
                tw('flex flex-row flex-nowrap items-center justify-start'),
                { gap: 9 },
              ]}
            >
              <GenderButton
                title="남성"
                onPress={() => setGender('M')}
                selected={gender === 'M'}
              />
              <GenderButton
                title="여성"
                onPress={() => setGender('F')}
                selected={gender === 'F'}
              />
            </View>
          </View>

          {/* 주소 */}
          <TouchableOpacity
            onPress={() => {
              if (!isAddressInputEnabled) {
                setIsPrivacyConsentModalOpen(true);
              }
            }}
            activeOpacity={isAddressInputEnabled ? 1 : 0.7}
          >
            <View
              style={[tw('flex flex-col w-full justify-center'), { gap: 10 }]}
            >
              <Text
                style={[
                  tw('font-primary-600 text-on-surface-label-input text-left'),
                  { fontSize: 15 },
                ]}
              >
                주소 {!isAddressInputEnabled && '(동의 필요)'}
              </Text>
              <View
                style={[
                  tw('flex flex-row flex-nowrap items-center justify-start'),
                  { gap: 9 },
                ]}
                pointerEvents={isAddressInputEnabled ? 'auto' : 'none'}
              >
                <AddressInput
                  gu={gu}
                  setGu={setGu}
                  dong={dong}
                  setDong={setDong}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* 로그아웃 / 회원탈퇴 */}
        <View style={tw('flex-row justify-center')}>
          <TouchableOpacity onPress={handleLogoutPress}>
            <Text style={tw('text-placeholder font-primary-500 text-xs')}>
              로그아웃
            </Text>
          </TouchableOpacity>
          <Text style={tw('mx-2 text-placeholder text-xs')}>|</Text>
          <TouchableOpacity onPress={handleWithdrawPress}>
            <Text style={tw('text-placeholder font-primary-500 text-xs')}>
              회원탈퇴
            </Text>
          </TouchableOpacity>
        </View>

        {/* 버튼 */}
        <View style={[tw('justify-end items-center')]}>
          <RoundButton
            title="저장하기"
            onPress={handleSavePress}
            disabled={!isFormReady}
            preset={'lg'}
          />
        </View>
      </View>

      {/* 개인정보 동의 모달 */}
      <PrivacyConsentModal
        setIsPrivacyConsentModalOpen={setIsPrivacyConsentModalOpen}
        setIsConsentRequiredAgreed={setIsConsentRequiredAgreed}
        setIsConsentOptionalAgreed={setIsConsentOptionalAgreed}
        setConsentedAt={setConsentedAt}
        isPrivacyConsentModalOpen={isPrivacyConsentModalOpen}
        isConsentRequiredAgreed={isConsentRequiredAgreed}
        isConsentOptionalAgreed={isConsentOptionalAgreed}
        onCancel={() => setIsPrivacyConsentModalOpen(false)}
      />
    </SafeAreaView>
  );
};

export default ProfileEditor;
