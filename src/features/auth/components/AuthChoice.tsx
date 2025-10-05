import { RootStackParamList } from '@/app/types';
import RoundButton from '@/shared/components/button/RoundButton';
import { tw } from '@/shared/libs/tw-helper';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Image, ImageStyle, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface AuthChoiceProps {
  setLoginScreenStep: React.Dispatch<React.SetStateAction<1 | 2>>;
}

const AuthChoice = ({ setLoginScreenStep }: AuthChoiceProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleLoginButtonPress = () => setLoginScreenStep(2);
  const handleNonMemberButtonPress = () => navigation.navigate('Map');

  return (
    <View style={tw('w-full h-full')}>
      <Image
        source={require('@/assets/imgs/loginBg.png')}
        style={tw('absolute top-0 left-0 w-full h-full') as ImageStyle}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,174,125,0)', 'rgba(0,174,125,0.5)']}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={tw('absolute top-0 left-0 w-full h-full')}
      />
      <View
        style={[
          tw('flex flex-1 flex-col justify-around items-center mt-32'),
          { gap: 240 },
        ]}
      >
        <Text
          style={[
            tw('font-secondary text-on-surface-secondary text-center'),
            { lineHeight: 110, fontSize: 64 },
          ]}
        >
          따릉이맵
        </Text>
        <View
          style={[tw('flex flex-col justify-between items-center'), { gap: 9 }]}
        >
          <RoundButton
            title="로그인으로 시작하기"
            onPress={handleLoginButtonPress}
            preset="lg"
          />
          <View style={[tw('border-b border-white'), { width: 81 }]}>
            <TouchableOpacity onPress={handleNonMemberButtonPress}>
              <Text
                style={[
                  tw(
                    'font-primary-700 text-on-surface-secondary text-center pt-3 pb-1',
                  ),
                  { fontSize: 10 },
                ]}
              >
                비회원으로 시작하기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AuthChoice;
