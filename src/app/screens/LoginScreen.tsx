import React from 'react';
import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';

const LoginScreen = () => {
  return (
    <View
      style={tw(
        'flex-1  items-center justify-center p-10 bg-surface-secondary',
      )}
    >
      <Text
        style={[tw('p-10 font-primary-600'), { fontSize: 64, lineHeight: 108 }]}
      >
        서울과학기술대학교
      </Text>
      <Text
        style={[
          tw('font-secondary text-on-surface-primary'),
          { fontSize: 64, lineHeight: 108 },
        ]}
      >
        서울과학기술대학교
      </Text>
    </View>
  );
};

export default LoginScreen;
