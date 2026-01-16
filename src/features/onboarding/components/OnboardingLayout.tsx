import StepIndicator from '@/shared/components/StepIndicator';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { tw } from '@/shared/libs/tw-helper';

interface OnboardingLayoutProps {
  step: number;
  totalSteps: number;
  text1: string;
  text2: string;
  imageSource: any;
  onStart: () => void;
  buttonLabel: string;
}

const OnboardingLayout = ({
  step,
  totalSteps,
  text1,
  text2,
  imageSource,
  onStart,
  buttonLabel,
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

      {/* 1. 상단 텍스트 */}
      <View style={tw('px-6 z-10')}>
        <View style={tw('items-center pt-10')}>
          <StepIndicator totalSteps={totalSteps} currentStep={step} />
        </View>

        <View
          style={[tw('items-center justify-center pt-8 pb-4'), { height: 140 }]}
        >
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

      {/* 2. 이미지 */}
      <View
        style={[
          tw('flex-1 w-full justify-end items-center'),
          { paddingBottom: 80 },
        ]}
      >
        <Image
          source={imageSource}
          style={{
            width: '100%',
            height: '100%',
            resizeMode: 'contain',
          }}
        />
      </View>

      {/* 3. 버튼 */}
      <View
        style={[tw('absolute w-full items-center'), { bottom: 30, zIndex: 20 }]}
      >
        <TouchableOpacity
          onPress={onStart}
          style={[
            tw('bg-white'),
            {
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderRadius: 30,
              width: '90%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
              elevation: 5,
            },
          ]}
        >
          <Text
            style={[
              tw('font-primary-700 text-center'),
              {
                color: '#01DA86',
                fontSize: 18,
              },
            ]}
          >
            {buttonLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
export default OnboardingLayout;
