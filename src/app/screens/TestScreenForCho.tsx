import CyclistProfileModal from '@/features/routing/components/CyclistProfileModal';
import RouteSelectContainer from '@/features/routing/components/RouteSelectContainer';
import NearbyStationModal from '@/features/station/components/NearbyStationModal';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';
import SlideModal from '@/shared/components/modal/SlideModal';
import { tw } from '@/shared/libs/tw-helper';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useRef, useEffect, useState } from 'react';
import { View, Alert, Platform, Text } from 'react-native';

const TestScreenForCho = () => {
  const cyclistProfileModalRef = useRef<BottomSheetModal | null>(null);

  const [PreferenceEnv, setPreferenceEnv] = useState<
    'urban' | 'nature' | 'balanced'
  >('urban');
  const [CyclistSkillLevel, setCyclistSkillLevel] = useState<
    'beginner' | 'intermediate' | 'expert'
  >('intermediate');
  const [FatigueTolerance, setFatigueTolerance] = useState<
    'lowFatigue' | 'mediumFatigue' | 'highFatigue'
  >('mediumFatigue');
  const [UsageType, setUsageType] = useState<
    'daily' | 'workout' | 'commute' | 'travel' | 'delivery'
  >('daily');
  const [CompanionType, setCompanionType] = useState<
    'alone' | 'friend' | 'child' | 'elderly'
  >('alone');

  useEffect(() => {
    cyclistProfileModalRef.current?.present();
  });
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <SlideModal
        ref={cyclistProfileModalRef}
        snapPoints={['50%']}
        onClose={() => cyclistProfileModalRef.current?.dismiss()}
      >
        <CyclistProfileModal
          setPreferenceEnv={setPreferenceEnv}
          setCyclistSkillLevel={setCyclistSkillLevel}
          setFatigueTolerance={setFatigueTolerance}
          setUsageType={setUsageType}
          setCompanionType={setCompanionType}
          PreferenceEnv={PreferenceEnv}
          CyclistSkillLevel={CyclistSkillLevel}
          FatigueTolerance={FatigueTolerance}
          UsageType={UsageType}
          CompanionType={CompanionType}
        />
      </SlideModal>
    </View>
  );
};

export default TestScreenForCho;
