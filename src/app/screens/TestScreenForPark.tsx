import { tw } from '@/shared/libs/tw-helper';
import React from 'react';
import CarbonStatusCard from '@/features/mypage/components/CarbonStatusCard';
import { View } from 'react-native';
const TestScreenForPark = () => {
  return (
    <View
      style={tw('flex-1 bg-surface-primary justify-center items-center px-5')}
    >
      <CarbonStatusCard />
    </View>
  );
};

export default TestScreenForPark;
