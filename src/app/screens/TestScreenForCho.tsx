import RouteSelectContainer from '@/features/routing/components/RouteSelectContainer';
import NearbyStationModal from '@/features/station/components/NearbyStationModal';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';
import { tw } from '@/shared/libs/tw-helper';
import React, { useRef, useEffect } from 'react';
import { View, Alert, Platform, Text } from 'react-native';

const TestScreenForCho = () => {
  return (
    <View
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    ></View>
  );
};

export default TestScreenForCho;
