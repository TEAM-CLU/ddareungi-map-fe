import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '@/shared/libs/tw-helper';
import { ScrollView } from 'react-native-gesture-handler';
import UsageCard from '@/features/mypage/components/main/UsageCard';
import CarbonStatusCard from '@/features/mypage/components/main/CarbonStatusCard';
import BackButton from '@/shared/components/button/BackButton';
import { DUMMY_USER_INFO, MYPAGE_MENU_ITEMS } from '../../model/mypage.constants';

const MypageMain = ({ onNavigate }: { onNavigate: (page: 'updateInfo' | 'updatePassword' | 'help') => void }) => {
  // const { data: user } = useUserInfoQuery()
  const user = DUMMY_USER_INFO;

  return (
    <SafeAreaView style={tw('flex-1 bg-surface-secondary pt-6')}>
      <ScrollView
        style={tw('flex-1 bg-surface-secondary')}
        showsVerticalScrollIndicator={false}
      >
        <View style={tw('flex-row items-center px-5 pb-8')}>
          <BackButton type="previous" iconColor="brand" />
          <Text
            style={tw('text-xl font-primary-700 text-on-surface-primary ml-4')}
          >
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
            totalDistance={user.totalDistance}
            totalTime={user.totalTime}
            calories={user.calories}
          />
        </View>

        {/* 탄소발자국 카드 */}
        <View style={tw('px-5 mb-6')}>
          <CarbonStatusCard
            carbonReduction={user.carbonSaved}
            plantingTrees={user.treesPlanted}
          />
        </View>

        {/* 설정 메뉴 */}
        <View style={tw('bg-surface-secondary px-5')}>
          <View style={[tw('border-t'), { borderColor: '#CFCCD4' }]}>
            {MYPAGE_MENU_ITEMS.map(item => (
              <TouchableOpacity
                key={item.key}
                onPress={() => onNavigate(item.key)}
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

export default MypageMain;
