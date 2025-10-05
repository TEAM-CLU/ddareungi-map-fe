import React, { useState } from 'react';
import PagerView from 'react-native-pager-view';
import OnboardingLayout from '@/features/onboarding/components/OnboardingLayout';
import { ONBOARDING_DATA } from '@/features/onboarding/model/onboarding.constants';

const OnboardingScreen = () => {
  const [onBoardingStep, setOnBoardingStep] = useState<1 | 2 | 3>(1);

  return (
    <PagerView
      style={{ flex: 1 }}
      initialPage={0}
      onPageSelected={(e) => {
        const { position } = e.nativeEvent;
        setOnBoardingStep((position + 1) as 1 | 2 | 3);
      }}
    >
      {ONBOARDING_DATA.map((item, index) => (
        <OnboardingLayout
          key={index}
          step={onBoardingStep}
          totalSteps={ONBOARDING_DATA.length}
          text1={item.text1}
          text2={item.text2}
          imageSource={item.imageSource}
        />
      ))}
    </PagerView>
  );
};

export default OnboardingScreen;
