import IconEclipse from '@/shared/components/icons/IconEclipse';
import { tw } from '@/shared/libs/tw-helper';
import { View } from 'react-native';

interface StepIndicatorProps {
  step: 'step1' | 'step2' | 'step3' | 'step4';
}
const StepIndicator = ({ step }: StepIndicatorProps) => {
  return (
    <View
      style={[tw('flex flex-row items-center justify-center'), { gap: 11 }]}
    >
      <IconEclipse
        color={step === 'step1' ? '#01DA86' : '#D9D9D9'}
        width={10}
        height={10}
      />
      <IconEclipse
        color={step === 'step2' ? '#01DA86' : '#D9D9D9'}
        width={10}
        height={10}
      />
      <IconEclipse
        color={step === 'step3' ? '#01DA86' : '#D9D9D9'}
        width={10}
        height={10}
      />
      <IconEclipse
        color={step === 'step4' ? '#01DA86' : '#D9D9D9'}
        width={10}
        height={10}
      />
    </View>
  );
};

export default StepIndicator;
