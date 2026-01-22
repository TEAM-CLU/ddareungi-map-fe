import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '@/shared/libs/tw-helper';
import { ScrollView } from 'react-native-gesture-handler';
import UsageCard from '@/features/mypage/components/main/UsageCard';
import CarbonStatusCard from '@/features/mypage/components/main/CarbonStatusCard';
import BackButton from '@/shared/components/button/BackButton';
import { MYPAGE_MENU_ITEMS } from '../../model/mypage.constants';
import { useUserInfoQuery } from '@/features/auth/services/user.queries';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import { useLogoutMutation } from '@/features/auth/services/auth.queries';
import { CommonActions } from '@react-navigation/native';
import { MypageShowingType } from '@/features/mypage/model/mypage.types';

interface MypageMainProps {
  onNavigate: (
    content: Extract<
      MypageShowingType,
      'updateInfo' | 'updatePassword' | 'help'
    >,
  ) => void;
}
const MypageMain = ({ onNavigate }: MypageMainProps) => {
  const { data: user } = useUserInfoQuery();
  const { mutate: logout } = useLogoutMutation();
  const { navigation } = useAppNavigation();

  const handleNavigate = (
    content: Extract<
      MypageShowingType,
      'updateInfo' | 'updatePassword' | 'help'
    >,
  ) => {
    if (content === 'help') {
      onNavigate(content);
      return;
    }
    if (!user || !user.data) {
      Alert.alert('로그인이 필요한 서비스입니다.', '로그인 하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    onNavigate(content);
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

  return (
    <SafeAreaView style={tw('flex-1 bg-surface-secondary pt-6')}>
      <View style={tw('flex-row items-center px-5 pb-8 relative top-0')}>
        <View style={tw('w-6')}>
          <BackButton
            type="custom"
            iconColor="brand"
            onPress={() => navigation.navigate('Map')}
          />
        </View>
        <Text style={tw('text-xl font-primary-700 text-on-surface-primary')}>
          마이페이지
        </Text>
      </View>
      <ScrollView
        style={tw('flex-1 bg-surface-secondary')}
        showsVerticalScrollIndicator={false}
      >
        {user && user.data ? (
          <>
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
                    style={tw(
                      'text-on-surface-primary font-primary-700 text-xl',
                    )}
                  >
                    {user.data.name}님
                  </Text>
                  <Text
                    style={tw(
                      'text-on-surface-primary font-primary-700 text-base',
                    )}
                  >
                    {user.data.email}
                  </Text>
                </View>
              </View>
            </View>

            {/* 이용이력 카드 */}
            <View style={tw('px-5 mb-4')}>
              <UsageCard
                totalDistance={user.data.totalDistance}
                totalTime={user.data.totalTime}
                calories={user.data.calories}
              />
            </View>

            {/* 탄소발자국 카드 */}
            <View style={tw('px-5 mb-6')}>
              <CarbonStatusCard
                carbonReduction={user.data.carbonReduction}
                plantingTrees={user.data.treesPlanted}
              />
            </View>
          </>
        ) : (
          <>
            {/* 비회원일 때 */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')} // 로그인 화면으로 이동
              activeOpacity={0.7}
              style={tw('flex-row items-center mb-6')}
            >
              {/* 프로필 아이콘 */}
              <View
                style={[
                  tw(
                    'bg-gray-300 rounded-full ml-5 mr-3 items-center justify-center',
                  ),
                  { width: 50, height: 50 },
                ]}
              ></View>

              <View style={tw('flex-1 justify-center')}>
                <View style={tw('flex-row items-center')}>
                  <Text
                    style={tw(
                      'text-on-surface-primary font-primary-700 text-xl mr-2',
                    )}
                  >
                    로그인이 필요합니다.
                  </Text>
                </View>
                <Text
                  style={tw(
                    'text-on-surface-tertiary font-primary-500 text-sm mt-1',
                  )}
                >
                  터치하여 로그인하기
                </Text>
              </View>
            </TouchableOpacity>

            {/* 이용이력 카드 */}
            <View style={tw('px-5 mb-4')}>
              <UsageCard totalDistance={0} totalTime={0} calories={0} />
            </View>

            {/* 탄소발자국 카드 */}
            <View style={tw('px-5 mb-6')}>
              <CarbonStatusCard carbonReduction={0} plantingTrees={0} />
            </View>
          </>
        )}

        {/* 설정 메뉴 */}
        <View style={tw('bg-surface-secondary px-5')}>
          <View style={[tw('border-t'), { borderColor: '#CFCCD4' }]}>
            {MYPAGE_MENU_ITEMS.map(item => (
              <TouchableOpacity
                key={item.key}
                onPress={() => handleNavigate(item.key)}
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

        {user && user.data && (
          <View style={tw('mt-4 mb-4 items-center')}>
            <TouchableOpacity
              onPress={handleLogoutPress}
              style={tw('p-2')}
              activeOpacity={0.6}
            >
              <Text
                style={tw(
                  'text-placeholder font-primary-500 text-xs underline',
                )}
              >
                로그아웃
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MypageMain;
