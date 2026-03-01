import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import GlobalModals from '@/shared/components/modal/GlobalModals';
import Toast from 'react-native-toast-message';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '@/screens/LoginScreen';
import MapScreen from '@/screens/MapScreen';
import OnboardingScreen from '@/screens/OnboardingScreen';
import RouteRecommendScreen from '@/screens/RouteRecommendScreen';
import RouteSelectScreen from '@/screens/RouteSelectScreen';
import SignUpScreen from '@/screens/SignUpScreen';
import MypageScreen from '@/screens/MypageScreen';
import MeasureScreen from '@/screens/MeasureScreen';
import { toastConfig } from '@/config/toastConfig';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  initialRouteName: string;
}

const AppNavigator = ({ initialRouteName }: AppNavigatorProps) => {
  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
          }}
          initialRouteName={initialRouteName as keyof RootStackParamList}
        >
          <Stack.Screen name="Onboarding">
            {props => (
              <OnboardingScreen
                {...props}
                onFinish={async () => {
                  await AsyncStorage.setItem('hasSeenOnboarding', 'YES');
                  props.navigation.replace('Login');
                }}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="RouteSelect" component={RouteSelectScreen} />
          <Stack.Screen
            name="RouteRecommend"
            component={RouteRecommendScreen}
          />
          <Stack.Screen name="Mypage" component={MypageScreen} />
          <Stack.Screen name="Measure" component={MeasureScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>

        <GlobalModals />
        <Toast config={toastConfig} />
      </View>
    </NavigationContainer>
  );
};

export default AppNavigator;