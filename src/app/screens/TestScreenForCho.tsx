import RouteSelectContainer from '@/features/routing/components/RouteSelectContainer';
import RouteSelectDetailModal from '@/features/routing/components/RouteSelectDetailModal';
import NearbyStationModal from '@/features/station/components/NearbyStationModal';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';
import SlideModal from '@/shared/components/modal/SlideModal';
import { tw } from '@/shared/libs/tw-helper';
import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useRef, useEffect } from 'react';
import { View, Alert, Platform, Text } from 'react-native';

const TestScreenForCho = () => {
  const RouteSelectDetailModalRef = useRef<BottomSheetModal | null>(null);

  useEffect(() => {
    RouteSelectDetailModalRef.current?.present();
  });
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <SlideModal
        ref={RouteSelectDetailModalRef}
        snapPoints={['50%', '75%']}
        initialIndex={1}
        onClose={() => RouteSelectDetailModalRef.current?.dismiss()}
      >
        <RouteSelectDetailModal />
      </SlideModal>
    </View>
  );
};

export default TestScreenForCho;
