import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useMeasurementStore } from '@/features/measurement/stores/useMeasurementStore';
import { useMeasurementOrchestrator } from '@/features/measurement/hooks/useMeasurementOrchestrator';
import { useMeasurementLocation } from '@/features/measurement/hooks/useMeasurementLocation';
import MeasureGoalScreen from '@/features/measurement/components/MeasureGoalScreen';
import MeasureCountdownOverlay from '@/features/measurement/components/MeasureCountdownOverlay';
import MeasureActiveScreen from '@/features/measurement/components/MeasureActiveScreen';
import MeasureEndModal from '@/features/measurement/components/MeasureEndModal';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';

export default function MeasureScreen() {
  const { navigation } = useAppNavigation();
  const { phase, setMeasurementScreenActive } = useMeasurementStore();
  const {
    handleStartMeasuring,
    handleCloseEnd,
  } = useMeasurementOrchestrator();

  useMeasurementLocation();

  useEffect(() => {
    setMeasurementScreenActive(true);
    return () => setMeasurementScreenActive(false);
  }, [setMeasurementScreenActive]);

  const handleCloseModal = () => {
    handleCloseEnd();
    navigation.navigate('Map');
  };

  return (
    <View style={{ flex: 1 }}>
      {(phase === 'idle' || phase === 'goal-setting') && <MeasureGoalScreen />}

      {phase === 'countdown' && (
        <>
          <MeasureGoalScreen />
          <MeasureCountdownOverlay onComplete={handleStartMeasuring} />
        </>
      )}

      {(phase === 'measuring' || phase === 'paused') && (
        <MeasureActiveScreen />
      )}

      <MeasureEndModal
        visible={phase === 'ended'}
        onClose={handleCloseModal}
      />
    </View>
  );
}
