import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import BackButton from '@/shared/components/button/BackButton';
import { formatBirthDate } from '@/shared/utils/date';
import { formatAddress } from '@/shared/utils/address';
import {
  useUpdateUserInfoMutation,
  useUserInfoQuery,
} from '@/features/auth/services/user.queries';
import SimpleLoading from '@/shared/components/SimpleLoading';
import Input from '@/shared/components/Input/Input';
import BirthDateInput from '@/shared/components/Input/BirthDateInput';
import GenderButton from '@/shared/components/button/GenderButton';
import AddressInput from '@/shared/components/Input/AddressInput';
import SquareButton from '@/shared/components/button/SquareButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

const EditProfile = () => {
  const { data: user, isLoading } = useUserInfoQuery();
  const { mutate: updateUser, isPending } = useUpdateUserInfoMutation();

  const [name, setName] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [gender, setGender] = useState<'M' | 'F' | undefined>(undefined);
  const [gu, setGu] = useState<string | null>(null);
  const [dong, setDong] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setGender(user.gender);
      if (user.birthDate) {
        const [y, m, d] = user.birthDate.split('-').map(Number);
        setYear(y);
        setMonth(m);
        setDay(d);
      }
      if (user.address) {
        const parts = user.address.split('-');
        if (parts.length >= 3) {
          setGu(parts[1]);
          setDong(parts[2]);
        }
      }
    }
  }, [user]);

  const formattedBirthDate = useMemo(() => {
    if (year && month && day) return formatBirthDate(year, month, day);
    return user?.birthDate ?? '';
  }, [year, month, day]);

  const formattedAddress = useMemo(() => {
    if (gu && dong) return formatAddress(gu, dong);
    return user?.address ?? '';
  }, [gu, dong]);

  const isValidName = name.trim().length > 0 && name.trim() !== '';
  const isValidGender = gender === 'M' || gender === 'F';
  const isValidBirthDate = !!formattedBirthDate;
  const isValidAddress = !!formattedAddress;

  const isFormReady =
    isValidName && isValidGender && isValidBirthDate && isValidAddress;

  const handleSavePress = () => {
    if (!isFormReady) {
      Alert.alert('모든 항목을 입력해주세요.');
      return;
    }

    const updatedData = {
      name: name ?? user?.name ?? '',
      gender: gender ?? user?.gender ?? '',
      birthDate: formattedBirthDate ?? user?.birthDate ?? '',
      address: formattedAddress ?? user?.address ?? '',
    };

    updateUser(updatedData, {
        onSuccess: res => {
          if ('message' in res) {
            Alert.alert(res.message);
          } else {
            Alert.alert('저장되었습니다.');
          }
        },
        onError: () => {
          Alert.alert('수정 중 오류가 발생했습니다.');
        },
      },
    );
  };

  if (isLoading) return <SimpleLoading title="" />;

  return (
    <SafeAreaView style={tw('flex-1 bg-surface-secondary pt-6')}>
      <View style={tw('flex-row items-center px-5 pb-20')}>
        <BackButton type="previous" iconColor="brand" />
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
          <View
            style={[tw('flex flex-col w-full justify-center'), { gap: 10 }]}
          >
            <Text
              style={[
                tw('font-primary-600 text-on-surface-label-input text-left'),
                { fontSize: 15 },
              ]}
            >
              주소
            </Text>
            <View
              style={[
                tw('flex flex-row flex-nowrap items-center justify-start'),
                { gap: 9 },
              ]}
            >
              <AddressInput
                gu={gu}
                setGu={setGu}
                dong={dong}
                setDong={setDong}
              />
            </View>
          </View>
        </View>

        {/* 로그아웃 / 회원탈퇴 */}
        <View style={tw('flex-row justify-center')}>
          <TouchableOpacity>
            <Text style={tw('text-placeholder font-primary-500 text-xs')}>
              로그아웃
            </Text>
          </TouchableOpacity>
          <Text style={tw('mx-2 text-placeholder text-xs')}>|</Text>
          <TouchableOpacity>
            <Text style={tw('text-placeholder font-primary-500 text-xs')}>
              회원탈퇴
            </Text>
          </TouchableOpacity>
        </View>

        {/* 버튼 */}
        <View style={[tw('justify-end items-center')]}>
          <SquareButton
            title="수정사항 저장하기"
            onPress={handleSavePress}
            disabled={!isFormReady}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EditProfile;
