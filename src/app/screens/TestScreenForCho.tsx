import NavigationStartModal from '@/features/navigation/components/NavigationStartModal';
import React, { useRef, useEffect } from 'react';
import { View, Alert, Platform, Text } from 'react-native';

const TestScreenForCho = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <NavigationStartModal />
    </View>
  );
};

export default TestScreenForCho;
