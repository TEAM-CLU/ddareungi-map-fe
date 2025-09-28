import { RootStackParamList } from '@/app/types';
import { tw } from '@/shared/libs/tw-helper';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { View, TouchableOpacity, Text } from 'react-native';

const AccountLinks = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const handleSignUpbuttonPress = () => navigation.navigate('Register');

  return (
    <View
      style={[
        tw('tems-center justify-center flex flex-row flex-nowrap h-4 w-full'),
        { gap: 5 },
      ]}
    >
      <TouchableOpacity
        onPress={handleSignUpbuttonPress}
        style={tw('flex justify-center items-center')}
      >
        <Text
          style={[
            tw('font-primary-500 text-on-surface-placeholder text-center'),
            { lineHeight: 22, fontSize: 12 },
          ]}
        >
          회원가입
        </Text>
      </TouchableOpacity>
      <Text
        style={[
          tw('font-primary-500 text-on-surface-placeholder text-center'),
          { lineHeight: 22, fontSize: 12 },
        ]}
      >
        ㅣ
      </Text>
      <TouchableOpacity style={tw('flex justify-center items-center')}>
        <Text
          style={[
            tw('font-primary-500 text-on-surface-placeholder text-center'),
            { lineHeight: 22, fontSize: 12 },
          ]}
        >
          비밀번호 재설정
        </Text>
      </TouchableOpacity>
      <Text
        style={[
          tw('font-primary-500 text-on-surface-placeholder text-center'),
          { lineHeight: 22, fontSize: 12 },
        ]}
      >
        ㅣ
      </Text>
      <TouchableOpacity style={tw('flex justify-center items-center')}>
        <Text
          style={[
            tw('font-primary-500 text-on-surface-placeholder text-center'),
            { lineHeight: 22, fontSize: 12 },
          ]}
        >
          계정 찾기
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AccountLinks;
