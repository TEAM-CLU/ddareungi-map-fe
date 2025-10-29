import { tw } from '@/shared/libs/tw-helper';
import React from 'react';
import CarbonStatusCard from '@/features/mypage/components/CarbonStatusCard';
import { View } from 'react-native';
import UsageCard from '@/features/mypage/components/UsageCard';
import EditProfile from '@/features/mypage/components/EditProfile';
const TestScreenForPark = () => {
  return (
    <View
      style={[
        tw('flex-1 bg-surface-primary'),
      ]}
    >
      <EditProfile />
    </View>
  );
};

export default TestScreenForPark;
