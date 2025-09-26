import React from 'react';
import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';

const TestScreenForPark = () => {
  return (
    <View
      style={[
        tw('flex-1 items-center justify-center flex flex-col'),
        { gap: 10 },
      ]}
    >
      <Text>Park</Text>
    </View>
  );
};

export default TestScreenForPark;
