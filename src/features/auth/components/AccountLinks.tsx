import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import { tw } from '@/shared/libs/tw-helper';
import { View, TouchableOpacity, Text } from 'react-native';

interface AccountLinksProps {
  setAccountFeatures: React.Dispatch<
    React.SetStateAction<'findAccount' | 'resetPwd' | null>
  >;
}

const AccountLinks = ({ setAccountFeatures }: AccountLinksProps) => {
  const { navigation } = useAppNavigation();

  const handleSignUpPress = () => navigation.navigate('SignUp');
  const handleFindAccountPress = () => setAccountFeatures('findAccount');
  const handleFindPwdPress = () => setAccountFeatures('resetPwd');

  return (
    <View
      style={[
        tw('items-center justify-center flex flex-row flex-nowrap h-4 w-full'),
        { gap: 5 },
      ]}
    >
      <TouchableOpacity
        onPress={handleSignUpPress}
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
      <TouchableOpacity
        onPress={handleFindPwdPress}
        style={tw('flex justify-center items-center')}
      >
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
      <TouchableOpacity
        onPress={handleFindAccountPress}
        style={tw('flex justify-center items-center')}
      >
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
