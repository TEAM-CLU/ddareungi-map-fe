import { useEffect, useState } from 'react';
import { useAuth } from '../providers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LandingScreen from '../screens/LandingScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import GlobalModals from '@/shared/components/modal/GlobalModals';
import Toast from 'react-native-toast-message';
import MapScreen from '../screens/MapScreen';
import RouteSelectScreen from '../screens/RouteSelectScreen';
import RouteRecommendScreen from '../screens/RouteRecommendScreen';
import MyPageScreen from '../screens/MyPageScreen';
import TestScreenForCho from '../screens/TestScreenForCho';
import TestScreenForPark from '../screens/TestScreenForPark';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isAuthLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null,
  );

  // 1. 앱 시작 시 온보딩 기록 확인
  useEffect(() => {
    const checkOnboarding = async () => {
      const status = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(status === 'YES');
    };
    checkOnboarding();
  }, []);

  // 2. 로딩 중일 때 처리
  // AuthProvider가 토큰 검사 중이거나 (isAuthLoading)
  // 온보딩 기록 검사 중이면
  // 랜딩스크린 보여줌
  if (isAuthLoading || hasSeenOnboarding === null) {
    return <LandingScreen />;
  }

  // 3. 로딩 끝난 후 처리
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={!hasSeenOnboarding ? 'Landing' : 'Map'}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />

        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="RouteSelect" component={RouteSelectScreen} />
        <Stack.Screen name="RouteRecommend" component={RouteRecommendScreen} />
        <Stack.Screen name="MyPage" component={MyPageScreen} />

        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* 테스트용 */}
        <Stack.Screen name="TestCho" component={TestScreenForCho} />
        <Stack.Screen name="TestPark" component={TestScreenForPark} />
      </Stack.Navigator>

      <GlobalModals />
      <Toast />
    </NavigationContainer>
  );
};

export default AppNavigator;
