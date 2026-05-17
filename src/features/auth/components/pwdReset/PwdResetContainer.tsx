import PwdResetSetPasswordStep from '@/features/auth/components/pwdReset/PwdResetSetPasswordStep';
import PwdResetVerifyEmailStep from '@/features/auth/components/pwdReset/PwdResetVerifyEmailStep';
import { AccountFeatureType } from '@/features/auth/model/common.types';
import { IconClose } from '@/shared/components/icons';
import { tw } from '@/shared/libs/tw-helper';
import { PrevScreenForFeatureBranch } from '@/shared/model/shared.types';
import { useState } from 'react';
import {
  TouchableOpacity,
  View,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PwdResetContainerProps {
  setAccountFeatures: React.Dispatch<React.SetStateAction<AccountFeatureType>>;
  prevScreen: PrevScreenForFeatureBranch;
  onDone: () => void;
}

const PwdResetContainer = ({
  setAccountFeatures,
  prevScreen,
  onDone,
}: PwdResetContainerProps) => {
  const [resetPwdStep, setResetPwdStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState<string>('');

  const handleClosePress = () => {
    if (prevScreen === 'login') setAccountFeatures(null);
    if (prevScreen === 'mypage') onDone();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={tw('w-full flex-1 relative')}>
        <TouchableOpacity
          onPress={handleClosePress}
          style={tw('absolute top-20 right-4')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconClose />
        </TouchableOpacity>
        <View
          style={[
            tw('w-full flex-1'),
            { paddingHorizontal: 36, marginTop: 30 },
          ]}
        >
          {resetPwdStep === 1 ? (
            <PwdResetVerifyEmailStep
              email={email}
              setEmail={setEmail}
              setPwdResetStep={setResetPwdStep}
            />
          ) : resetPwdStep === 2 ? (
            <PwdResetSetPasswordStep
              email={email}
              setResetPwdStep={setResetPwdStep}
              setAccountFeatures={setAccountFeatures}
              prevScreen={prevScreen}
              onDone={onDone}
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

export default PwdResetContainer;
