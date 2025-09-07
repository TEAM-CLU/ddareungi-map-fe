import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnboardingScreen from '@/app/screens/OnboardingScreen';
import LoginScreen from '@/app/screens/LoginScreen';
import RegisterScreen from '@/app/screens/RegisterScreen';
import MainScreen from '@/app/screens/MainScreen';
import MyPageScreen from '@/app/screens/MyPageScreen';
import NavigationScreen from '@/app/screens/NavigationScreen';
import { tw } from '@/shared/libs/tw-helper';

type RootStackParamList = {
  DevHub: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  MyPage: undefined;
  Navigation: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const DevHubScreen = ({ navigation }: any) => {
  const routes: Array<keyof RootStackParamList> = [
    'Onboarding',
    'Login',
    'Register',
    'Main',
    'MyPage',
    'Navigation',
  ];

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
        🔧 DevHub
      </Text>
      {routes.map(name => (
        <TouchableOpacity
          key={name}
          onPress={() => navigation.navigate(name)}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 14,
            backgroundColor: '#e5e7eb',
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          <Text style={tw('text-onSurface-primary')}>{name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const DevHub = () => {
  return (
    <SafeAreaView style={tw('flex-1')} edges={['top', 'bottom']}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
          initialRouteName="DevHub"
        >
          <Stack.Screen name="DevHub" component={DevHubScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="MyPage" component={MyPageScreen} />
          <Stack.Screen name="Navigation" component={NavigationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default DevHub;
