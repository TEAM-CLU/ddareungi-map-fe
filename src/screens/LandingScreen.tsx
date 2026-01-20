import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import { tw } from '@/shared/libs/tw-helper';
import { View, Text, Image, ImageStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/app/providers';
import { useBlockBackNavigation } from '@/shared/hooks/useBlockBackNavigation';

const LandingScreen = () => {
  const { navigation } = useAppNavigation();
  const { isAuthLoading, accessToken } = useAuth();

  useBlockBackNavigation(true);

  useEffect(() => {
    if (isAuthLoading) return;

    const selectNavigation = async () => {
      const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');

      if (accessToken) {
        navigation.replace('Map');
      } else if (hasSeen === 'YES') {
        navigation.replace('Map');
      } else {
        navigation.replace('Onboarding');
      }
    };
    selectNavigation();
  }, [isAuthLoading, accessToken, navigation]);

  return (
    <SafeAreaView
      style={[
        tw(
          'flex-1 w-full flex flex-col justify-start relative bg-brand-primary',
        ),
      ]}
    >
      <Image
        source={require('@/assets/imgs/landingBg.png')}
        style={[tw('absolute w-full h-full') as ImageStyle, { bottom: -200 }]}
        resizeMode="cover"
      />
      <View
        style={[
          tw('flex w-full flex-col items-start'),
          { paddingTop: 120, paddingHorizontal: 41 },
        ]}
      >
        <Text style={tw('font-primary-700 text-on-surface-secondary text-xl')}>
          출발부터 도착까지{'\n'}따릉이맵과 함께 이동해요!
        </Text>

        <Text
          style={[
            tw('font-secondary text-4xl text-on-surface-secondary'),
            { fontSize: 48, lineHeight: 110 },
          ]}
        >
          따릉이맵
        </Text>
      </View>
      <Image
        source={require('@/assets/imgs/landingImg.png')}
        style={[
          tw('w-full h-full absolute right-0') as ImageStyle,
          { bottom: -150 },
        ]}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

export default LandingScreen;
