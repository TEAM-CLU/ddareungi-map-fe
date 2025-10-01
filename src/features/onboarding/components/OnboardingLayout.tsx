import StepIndicator from '@/shared/components/StepIndicator';
import { Image, ImageStyle, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { tw } from '@/shared/libs/tw-helper';

interface OnboardingLayoutProps {
  step: number;
  totalSteps: number;
  text1: string;
  text2: string;
  imageSource: any;
}

const OnboardingLayout = ({
  step,
  totalSteps,
  text1,
  text2,
  imageSource,
}: OnboardingLayoutProps) => {
  return (
    <SafeAreaView
      style={tw('flex-1 bg-surface-primary relative')}
      edges={['top', 'bottom']}
    >
      <LinearGradient
        colors={['rgba(1,218,134,0)', '#01DA86']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={tw('absolute bottom-0 w-full h-1/3')}
      />

      <View style={tw('flex-1 px-6')}>
        <View style={tw('items-center pt-10')}>
          <StepIndicator totalSteps={totalSteps} currentStep={step} />
        </View>

        <View style={tw('h-[82px] items-center pt-12')}>
          <Text
            style={[
              tw('font-primary-600 text-[#000] text-center'),
              { fontSize: 20, lineHeight: 30 },
            ]}
          >
            {text1}
          </Text>
          <Text
            style={[
              tw('font-primary-700 text-[#000] text-center'),
              { fontSize: 20, lineHeight: 30 },
            ]}
          >
            {text2}
          </Text>
        </View>
      </View>

      <View style={[tw('absolute w-full items-center'), { bottom: 50 }]}>
        <Image
          source={imageSource}
          style={[tw('w-full'), { height: 522 }] as ImageStyle}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};
export default OnboardingLayout;
