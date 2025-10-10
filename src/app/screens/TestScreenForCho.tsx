import RouteSelectContainer from '@/features/routing/components/RouteSelectContainer';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';
import React, { useRef, useEffect } from 'react';
import { View, Alert, Platform } from 'react-native';

const TestScreenForCho = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <RouteSelectContainer />
    </View>
  );
};

export default TestScreenForCho;
