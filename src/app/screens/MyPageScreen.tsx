import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '@/shared/libs/tw-helper';
import { ScrollView } from 'react-native-gesture-handler';
import UsageCard from '@/features/mypage/components/UsageCard';
import CarbonStatusCard from '@/features/mypage/components/CarbonStatusCard';
import BackButton from '@/shared/components/button/BackButton';
import { useUserInfoQuery } from '@/features/auth/services/user.queries';

const MyPageScreen = () => {
  // const { data, isLoading, isError } = useUserInfoQuery();
  // const { setUser } = useUser();

  // useEffect(() => {
  //   if (data) setUser(data);
  // }, [data, setUser]);

  const user = {
    name: '홍길동',
    email: 'honggildong@example.com',
  };
  const usageData = {
    totalDistance: 15300,
    totalTime: 96900,
    calories: 156,
  };
  const co2Data = {
    carbonSaved: 1.5,
    treesPlanted: 20,
  };

  return (
    <SafeAreaView style={tw('flex-1 bg-surface-secondary pt-6')}>
      <ScrollView
        style={tw('flex-1 bg-surface-secondary')}
        showsVerticalScrollIndicator={false}
      >
        <View style={tw('flex-row items-center px-5 pb-6')}>
          <BackButton type="previous" iconColor="brand" />
          <Text style={tw('text-xl font-primary-700 text-on-surface-primary ml-4')}>
            마이페이지
          </Text>
        </View>

        {/* 사용자 프로필 */}
        <View style={tw('flex-row items-center mb-6')}>
          <View
            style={[
              tw('bg-brand-primary rounded-full ml-5 mr-3'),
              { width: 50, height: 50 },
            ]}
          />
          <View>
            <View style={tw('flex-1 justify-center h-50')}>
              <Text
                style={tw('text-on-surface-primary font-primary-700 text-xl')}
              >
                {user.name}님
              </Text>
              <Text
                style={tw('text-on-surface-primary font-primary-700 text-base')}
              >
                {user.email}
              </Text>
            </View>
          </View>
        </View>

        {/* 이용이력 카드 */}
        <View style={tw('px-5 mb-4')}>
          <UsageCard
            totalDistance={usageData.totalDistance}
            totalTime={usageData.totalTime}
            calories={usageData.calories}
          />
        </View>

        {/* 탄소발자국 카드 */}
        <View style={tw('px-5 mb-6')}>
          <CarbonStatusCard
            carbonReduction={co2Data.carbonSaved}
            plantingTrees={co2Data.treesPlanted}
          />
        </View>

        {/* 설정 메뉴 */}
        <View style={tw('bg-surface-secondary px-5')}>
          <View style={[tw('border-t'), { borderColor: '#CFCCD4' }]}>
            {[
              { label: '내 정보 수정' },
              { label: '비밀번호 변경' },
              { label: '도움말' },
            ].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  tw(
                    'flex-row justify-between items-center px-2 py-4 border-b',
                  ),
                  { borderColor: '#CFCCD4' },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={tw('text-on-surface-primary font-primary-500 text-sm')}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyPageScreen;
