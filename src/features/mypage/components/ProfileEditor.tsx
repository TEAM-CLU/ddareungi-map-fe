import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import BackButton from '@/shared/components/button/BackButton';
import {
  useDeleteUserMutation,
  useUpdateUserInfoMutation,
  useUserInfoQuery,
} from '@/features/auth/services/user.queries';
import SimpleLoading from '@/shared/components/SimpleLoading';
import Input from '@/shared/components/Input/Input';
import BirthYearInput from '@/shared/components/Input/BirthYearInput';
import GenderButton from '@/shared/components/button/GenderButton';
import AddressInput from '@/shared/components/Input/AddressInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogoutMutation } from '@/features/auth/services/auth.queries';
import PrivacyConsentModal from '@/features/auth/components/PrivacyConsentModal';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import RoundButton from '@/shared/components/button/RoundButton';
import useProfileEdit from '@/features/mypage/hooks/useProfileEdit';

const ProfileEditor = ({ onBack }: { onBack: () => void }) => {
  const { data: userInfo, isPending } = useUserInfoQuery();
  const { navigation } = useAppNavigation();
  const { mutate: updateUser } = useUpdateUserInfoMutation();
  const { mutate: logout } = useLogoutMutation();
  const { mutate: deleteUser } = useDeleteUserMutation();

  const {
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
  } = useProfileEdit({
    userInfo: userInfo!,
    updateUser: updateUser,
    logout: logout,
    deleteUser: deleteUser,
    navigation,
  });

  if (isPending) return <SimpleLoading title="정보 조회중" />;

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

          {isConsentOptionalAgreed && (
            <>
              {/* 태어난 연도 */}
              <View
                style={[tw('flex flex-col w-full justify-center'), { gap: 10 }]}
              >
                <Text
                  style={[
                    tw('font-primary-600 text-on-surface-label-input text-left'),
                    { fontSize: 15 },
                  ]}
                >
                  태어난 연도 (선택)
                </Text>
                <BirthYearInput
                  year={year}
                  setYear={setYear}
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
                  성별 (선택)
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
              {/* 거주지 */}
              <View
                style={[tw('flex flex-col w-full justify-center'), { gap: 10 }]}
              >
                <Text
                  style={[
                    tw('font-primary-600 text-on-surface-label-input text-left'),
                    { fontSize: 15 },
                  ]}
                >
                  거주지 (선택)
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
            </>
          )}

          {!isConsentOptionalAgreed && (
            <TouchableOpacity onPress={() => setIsPrivacyConsentModalOpen(true)}>
              <Text
                style={[
                  tw('font-primary-500 text-brand-primary text-left'),
                  { fontSize: 13 },
                ]}
              >
                선택 정보(성별/태어난 연도/거주지) 수집 동의하기
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 로그아웃 / 회원탈퇴 */}
        <View style={tw('flex-row justify-center')}>
          <TouchableOpacity onPress={handleLogoutPress}>
            <Text style={tw('text-placeholder font-primary-500 text-xs')}>
              로그아웃
            </Text>
          </TouchableOpacity>
          <Text style={tw('mx-2 text-placeholder text-xs')}>|</Text>
          <TouchableOpacity onPress={handleDeleteAccountPress}>
            <Text style={tw('text-placeholder font-primary-500 text-xs')}>
              회원탈퇴
            </Text>
          </TouchableOpacity>
        </View>

        {/* 버튼 */}
        <View style={[tw('justify-end items-center')]}>
          <RoundButton
            title="저장하기"
            onPress={handleSaveChangesPress}
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
