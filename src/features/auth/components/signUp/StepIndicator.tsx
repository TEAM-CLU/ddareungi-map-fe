import IconEclipse from '@/shared/components/icons/IconEclipse';
import { tw } from '@/shared/libs/tw-helper';
import { View } from 'react-native';

interface StepIndicatorProps {
  step: 'email' | 'password' | 'profile';
}
const StepIndicator = ({ step }: StepIndicatorProps) => {
  return (
    <View
      style={[tw('flex flex-row items-center justify-center'), { gap: 11 }]}
    >
      <IconEclipse
        color={step === 'email' ? '#01DA86' : '#D9D9D9'}
        width={10}
        height={10}
      />
      <IconEclipse
        color={step === 'password' ? '#01DA86' : '#D9D9D9'}
        width={10}
        height={10}
      />
      <IconEclipse
        color={step === 'profile' ? '#01DA86' : '#D9D9D9'}
        width={10}
        height={10}
      />
    </View>
  );
};

export default StepIndicator;
