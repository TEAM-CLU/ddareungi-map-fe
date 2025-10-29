import { tw } from '@/shared/libs/tw-helper';
import React from 'react';
import { View } from 'react-native';
import EditProfile from '@/features/mypage/components/EditProfile';
const TestScreenForPark = () => {
  return (
    <View style={[tw('flex-1 bg-surface-primary')]}>
      <EditProfile onBack={() => {}} />
    </View>
  );
};

export default TestScreenForPark;
