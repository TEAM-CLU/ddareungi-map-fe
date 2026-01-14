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
import { View } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="Landing"
        >
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />

          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="RouteSelect" component={RouteSelectScreen} />
          <Stack.Screen
            name="RouteRecommend"
            component={RouteRecommendScreen}
          />
          <Stack.Screen name="MyPage" component={MyPageScreen} />

          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />

          {/* 테스트용 */}
          <Stack.Screen name="TestCho" component={TestScreenForCho} />
          <Stack.Screen name="TestPark" component={TestScreenForPark} />
        </Stack.Navigator>

        <GlobalModals />
        <Toast />
      </View>
    </NavigationContainer>
  );
};

export default AppNavigator;
