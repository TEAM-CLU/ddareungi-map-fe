import React, { useRef, useState } from 'react';
import PagerView from 'react-native-pager-view';
import OnboardingLayout from '@/features/onboarding/components/OnboardingLayout';
import { useBlockBackNavigation } from '@/shared/hooks/useBlockBackNavigation';
import { ONBOARDING_DESCRIPTION_DATA } from '@/features/onboarding/model/onboarding.constants';

type OnboardingScreenProps = {
  onFinish?: () => void;
  buttonLabel?: string;
};

const OnboardingScreen = ({
  onFinish,
  buttonLabel = '시작하기',
}: OnboardingScreenProps) => {
  useBlockBackNavigation(true);

  const [onBoardingStep, setOnBoardingStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(
    1,
  );
  const pagerRef = useRef<PagerView>(null);

  const handleJumpToNextStepPress = (index: number) => {
    const isLastStep = index === ONBOARDING_DESCRIPTION_DATA.length - 1;

    if (isLastStep) {
      onFinish?.();
      return;
    }
    pagerRef.current?.setPage(index + 1);
  };

  return (
    <PagerView
      ref={pagerRef}
      style={{ flex: 1 }}
      initialPage={0}
      onPageSelected={e => {
        const { position } = e.nativeEvent;
        setOnBoardingStep((position + 1) as 1 | 2 | 3 | 4 | 5 | 6);
      }}
    >
      {ONBOARDING_DESCRIPTION_DATA.map((item, index) => {
        const isLastStep = index === ONBOARDING_DESCRIPTION_DATA.length - 1;
        const currentLabel = isLastStep ? buttonLabel : '다음';

        return (
          <OnboardingLayout
            key={index}
            step={onBoardingStep}
            totalSteps={ONBOARDING_DESCRIPTION_DATA.length}
            text1={item.text1}
            text2={item.text2}
            imageSource={item.imageSource}
            onStart={() => handleJumpToNextStepPress(index)}
            buttonLabel={currentLabel}
          />
        );
      })}
    </PagerView>
  );
};

export default OnboardingScreen;
