import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '@/shared/libs/tw-helper';
import OnboardingScreen from '@/app/screens/OnboardingScreen';
import LoginScreen from '@/app/screens/LoginScreen';
import RegisterScreen from '@/app/screens/RegisterScreen';
import MyPageScreen from '@/app/screens/MyPageScreen';
import LandingScreen from '@/app/screens/LandingScreen';
import MapScreen from '@/app/screens/MapScreen';
import RouteSelectScreen from '@/app/screens/RouteSelectScreen';
import TestScreen from '@/app/screens/TestScreen';
import { RootStackParamList } from '@/app/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const DevHubScreen = ({ navigation }: any) => {
  const routes: Array<keyof RootStackParamList> = [
    'Landing',
    'Onboarding',
    'Login',
    'Register',
    'Map',
    'RouteSelect',
    'MyPage',
    'Test',
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
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="MyPage" component={MyPageScreen} />
          <Stack.Screen name="RouteSelect" component={RouteSelectScreen} />
          <Stack.Screen name="Test" component={TestScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default DevHub;
