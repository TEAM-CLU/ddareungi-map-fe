import { tw } from '@/shared/libs/tw-helper';
import { View } from 'react-native';
import { IconEclipse } from './icons';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}
const StepIndicator = ({ totalSteps, currentStep }: StepIndicatorProps) => {
  return (
    <View
      style={[tw('flex flex-row items-center justify-center'), { gap: 11 }]}
    >
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        return (
          <IconEclipse
            key={stepNumber}
            color={currentStep === stepNumber ? '#01DA86' : '#D9D9D9'}
            width={10}
            height={10}
          />
        );
      })}
    </View>
  );
};

export default StepIndicator;
