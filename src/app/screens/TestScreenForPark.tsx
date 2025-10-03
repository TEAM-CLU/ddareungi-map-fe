import React from 'react';
import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from '@/shared/components/Footer';

const TestScreenForPark = () => {
  return (
    <View style={tw('flex-1 bg-white')}>
      <View style={tw('flex-1')}>
        <Text style={tw('text-center mt-10 text-lg')}>
          Test Screen For Park
        </Text>
      </View>

      <Footer />
    </View>
  );
};

export default TestScreenForPark;
