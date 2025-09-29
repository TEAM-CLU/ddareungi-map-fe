import AccountLinks from '@/features/auth/components/AccountLinks';
import SocialLoginLinks from '@/features/auth/components/SocialLoginLinks';
import SquareButton from '@/shared/components/button/SquareButton';
import IconClose from '@/shared/components/icons/IconClose';
import Input from '@/shared/components/Input/Input';
import { tw } from '@/shared/libs/tw-helper';
import { TouchableOpacity, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface IdFinderProps {
  setAccountFeatures: React.Dispatch<
    React.SetStateAction<'findId' | 'resetPwd' | null>
  >;
}

const IdFinder = ({ setAccountFeatures }: IdFinderProps) => {
  const handleCloseButtonPress = () => setAccountFeatures(null);

  return (
    <SafeAreaView style={tw('w-full flex-1')}>
      <TouchableOpacity
        onPress={handleCloseButtonPress}
        style={tw('fixed top-5 left-4')}
      >
        <IconClose />
      </TouchableOpacity>
      <Text style={tw('font-secondary text-brand-primary text-center')}>
        아이디 찾기 컴포넌트
      </Text>
    </SafeAreaView>
  );
};

export default IdFinder;
