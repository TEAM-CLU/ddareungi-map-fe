import { tw } from '@/shared/libs/tw-helper';
import React from 'react';
import CarbonStatusCard from '@/features/mypage/components/CarbonStatusCard';
import { View } from 'react-native';
import UsageCard from '@/features/mypage/components/UsageCard';
const TestScreenForPark = () => {
  return (
    <View
      style={[tw('flex-1 bg-surface-primary justify-center items-center px-5'), { gap: 15 }]}
    >
      <UsageCard totalTime={234} totalDistance={15.3} calories={156} />
      <CarbonStatusCard carbonReduction={1.5} plantingTrees={20} />
    </View>
  );
};

export default TestScreenForPark;
