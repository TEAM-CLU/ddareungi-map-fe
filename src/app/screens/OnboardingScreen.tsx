import React, { useState } from 'react';
import PagerView from 'react-native-pager-view';
import OnboardingLayout from '@/features/onboarding/components/OnboardingLayout';
import { ONBOARDING_DATA } from '@/features/onboarding/model/onboarding.constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnboardingScreenProps = {
  navigation?: any;
};

const OnboardingScreen = ({ navigation }: OnboardingScreenProps) => {
  const [onBoardingStep, setOnBoardingStep] = useState<1 | 2 | 3 | 4>(1);

  const handleStartPress = async() => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'YES');
    navigation.replace('Login');
  };

  return (
    <PagerView
      style={{ flex: 1 }}
      initialPage={0}
      onPageSelected={(e) => {
        const { position } = e.nativeEvent;
        setOnBoardingStep((position + 1) as 1 | 2 | 3 | 4);
      }}
    >
      {ONBOARDING_DATA.map((item, index) => {
        const isLastStep = index === ONBOARDING_DATA.length - 1;
        return (          
          <OnboardingLayout
            key={index}
            step={onBoardingStep}
            totalSteps={ONBOARDING_DATA.length}
            text1={item.text1}
            text2={item.text2}
            imageSource={item.imageSource}
            onStart={isLastStep ? handleStartPress : undefined}
          />
        )
      })}
    </PagerView>
  );
};

export default OnboardingScreen;
