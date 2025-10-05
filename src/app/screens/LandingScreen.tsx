import { tw } from '@/shared/libs/tw-helper';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { View, Text, Image, ImageStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';

type LandingNavProp = StackNavigationProp<RootStackParamList, 'Landing'>;

const LandingScreen = () => {
  const navigation = useNavigation<LandingNavProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Onboarding');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

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
