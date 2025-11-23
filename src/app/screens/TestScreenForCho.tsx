import InstructionBanner from '@/features/navigation/components/InstructionBanner';
import NavigationStartModal from '@/features/navigation/components/NavigationStartModal';
import RouteSelectContainer from '@/features/routing/components/RouteSelectContainer';
import RouteSelectDetailModal from '@/features/routing/components/RouteSelectedDetailModal';
import NearbyStationModal from '@/features/station/components/NearbyStationModal';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';
import SlideModal from '@/shared/components/modal/SlideModal';
import { tw } from '@/shared/libs/tw-helper';
import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';
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
