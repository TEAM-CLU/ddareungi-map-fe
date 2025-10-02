import AccountLinks from '@/features/auth/components/AccountLinks';
import PwdResetSetPasswordStep from '@/features/auth/components/pwdRest/PwdResetSetPasswordStep';
import PwdResetVerifyEmailStep from '@/features/auth/components/pwdRest/PwdResetVerifyEmailStep';
import SignUpPwdStep from '@/features/auth/components/signUp/SignUpPwdStep';
import SocialLoginLinks from '@/features/auth/components/SocialLoginLinks';
import SquareButton from '@/shared/components/button/SquareButton';
import IconClose from '@/shared/components/icons/IconClose';
import Input from '@/shared/components/Input/Input';
import { tw } from '@/shared/libs/tw-helper';
import { useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PwdResetterContainerProps {
  setAccountFeatures: React.Dispatch<
    React.SetStateAction<'findId' | 'resetPwd' | null>
  >;
}

const PwdResetterContainer = ({
  setAccountFeatures,
}: PwdResetterContainerProps) => {
  const [resetPwdStep, setResetPwdStep] = useState<'step1' | 'step2'>('step1');
  const [email, setEmail] = useState<string>('');

  const handleCloseButtonPress = () => setAccountFeatures(null);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={tw('w-full flex-1')}>
        <TouchableOpacity
          onPress={handleCloseButtonPress}
          style={tw('fixed top-5 left-4')}
        >
          <IconClose />
        </TouchableOpacity>
        <View
          style={[
            tw('w-full flex-1'),
            { paddingHorizontal: 36, marginTop: 30 },
          ]}
        >
          {resetPwdStep === 'step1' ? (
            <PwdResetVerifyEmailStep
              email={email}
              setEmail={setEmail}
              setPwdResetStep={setResetPwdStep}
            />
          ) : resetPwdStep === 'step2' ? (
            <PwdResetSetPasswordStep
              email={email}
              setResetPwdStep={setResetPwdStep}
              setAccountFeatures={setAccountFeatures}
            />
          ) : (
            <PwdResetVerifyEmailStep
              email={email}
              setEmail={setEmail}
              setPwdResetStep={setResetPwdStep}
            />
          )}
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default PwdResetterContainer;
