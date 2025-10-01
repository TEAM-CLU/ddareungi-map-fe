import React, { useState } from 'react';
import PagerView from 'react-native-pager-view';
import OnboardingLayout from '@/features/onboarding/components/OnboardingLayout';
import { ONBOARDING_DATA } from '@/features/onboarding/model/onboarding.constants';

const OnboardingScreen = () => {
  const [onBoardingStep, setOnBoardingStep] = useState<
    'step1' | 'step2' | 'step3'
  >('step1');

  return (
    <PagerView
      style={{ flex: 1 }}
      initialPage={0}
      onPageSelected={(event) => {
        const { position } = event.nativeEvent;
        setOnBoardingStep(`step${position + 1}` as 'step1' | 'step2' | 'step3');
      }}
    >
      {ONBOARDING_DATA.map((item) => (
        <OnboardingLayout
          key={item.step}
          step={item.step as 'step1' | 'step2' | 'step3'}
          text1={item.text1}
          text2={item.text2}
          imageSource={item.imageSource}
        />
      ))}
    </PagerView>
  );
};

export default OnboardingScreen;
