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
import MeasureBackgroundMap from '@/features/measurement/components/MeasureBackgroundMap';

export default function MeasureScreen() {
  const { navigation } = useAppNavigation();
  const { phase, setMeasurementScreenActive } = useMeasurementStore();
  const {
    handleStartCountdown,
    handleStartMeasuring,
    handleTogglePause,
    handleFinishMeasurement,
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
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <MeasureBackgroundMap />
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            // 측정 UI 가독성을 위한 반투명 레이어
            backgroundColor: 'rgba(255, 255, 255, 0.42)',
          }}
        />
      </View>

      {(phase === 'idle' || phase === 'goal-setting') && (
        <MeasureGoalScreen onStartCountdown={handleStartCountdown} />
      )}

      {phase === 'countdown' && (
        <>
          <MeasureGoalScreen onStartCountdown={handleStartCountdown} />
          <MeasureCountdownOverlay onComplete={handleStartMeasuring} />
        </>
      )}

      {(phase === 'measuring' || phase === 'paused') && (
        <MeasureActiveScreen
          onTogglePause={handleTogglePause}
          onFinishMeasurement={handleFinishMeasurement}
        />
      )}

      <MeasureEndModal
        visible={phase === 'ended'}
        onClose={handleCloseModal}
      />
    </View>
  );
}
