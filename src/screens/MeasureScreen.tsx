import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMeasurementStore } from '@/features/measurement/stores/useMeasurementStore';
import { useMeasurementOrchestrator } from '@/features/measurement/hooks/useMeasurementOrchestrator';
import { useMeasurementLocation } from '@/features/measurement/hooks/useMeasurementLocation';
import MeasureGoalScreen from '@/features/measurement/components/MeasureGoalScreen';
import MeasureCountdownOverlay from '@/features/measurement/components/MeasureCountdownOverlay';
import MeasureActiveScreen from '@/features/measurement/components/MeasureActiveScreen';
import MeasureEndModal from '@/features/measurement/components/MeasureEndModal';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import MeasureBackgroundMap from '@/features/measurement/components/MeasureBackgroundMap';
import { IconChevronDown } from '@/shared/components/icons';
import SimpleLoading from '@/shared/components/SimpleLoading';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { tw } from '@/shared/libs/tw-helper';

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

  // ─────────────────────────────────────────────
  // 초기 로딩 오버레이: 첫 GPS 좌표 수신 전까지 표시
  // ─────────────────────────────────────────────
  const locationMetaData = useMyPositionStore(s => s.locationMetaData);
  const isMapPositioned = !!locationMetaData?.coordinate;

  // ─────────────────────────────────────────────
  // 분할 레이아웃은 실제 측정 중(measuring/paused)에만 활성화
  // ─────────────────────────────────────────────
  const isSplitLayout = phase === 'measuring' || phase === 'paused';

  // 측정 종료 시 전체화면 모드 초기화
  const [isMapExpanded, isMapExpandedSet] = useState(false);
  useEffect(() => {
    if (!isSplitLayout) isMapExpandedSet(false);
  }, [isSplitLayout]);

  return (
    <View style={tw('flex-1')}>
      {/* ── 지도: 항상 절대좌표 전체화면 유지 → WebView 리마운트 없음 ── */}
      <View style={tw('absolute top-0 left-0 right-0 bottom-0')}>
        <MeasureBackgroundMap isTracking={!isMapExpanded} />
      </View>

      {/* ── 목표 설정 / 카운트다운: 반투명 오버레이 + 전체화면 UI ── */}
      {!isSplitLayout && (
        <View style={tw('absolute top-0 left-0 right-0 bottom-0')}>
          <View
            pointerEvents="none"
            style={[
              tw('absolute top-0 left-0 right-0 bottom-0'),
              { backgroundColor: 'rgba(255, 255, 255, 0.42)' },
            ]}
          />
          {(phase === 'idle' || phase === 'goal-setting') && (
            <MeasureGoalScreen onStartCountdown={handleStartCountdown} />
          )}
          {phase === 'countdown' && (
            <>
              <MeasureGoalScreen onStartCountdown={handleStartCountdown} />
              <MeasureCountdownOverlay onComplete={handleStartMeasuring} />
            </>
          )}
        </View>
      )}

      {/* ── 측정 중 분할 레이아웃 ── */}
      {isSplitLayout && !isMapExpanded && (
        <View style={tw('flex-1')}>
          {/* 상단 절반: 지도 투명 노출, 탭 → 전체화면 */}
          <TouchableOpacity
            style={tw('flex-1 justify-end items-center pb-3')}
            activeOpacity={1}
            onPress={() => isMapExpandedSet(true)}
          >
            <View
              style={[
                tw('px-3.5'),
                {
                  backgroundColor: 'rgba(0, 0, 0, 0.32)',
                  borderRadius: 14,
                  paddingVertical: 5,
                },
              ]}
            >
              <Text style={tw('text-white text-xs font-primary-600')}>
                지도 확대
              </Text>
            </View>
          </TouchableOpacity>

          {/* 하단 절반: 측정 지표 UI */}
          <View style={tw('flex-1')}>
            <MeasureActiveScreen
              onTogglePause={handleTogglePause}
              onFinishMeasurement={handleFinishMeasurement}
            />
          </View>
        </View>
      )}

      {/* ── 지도 전체화면 모드: 접기 버튼 ── */}
      {isSplitLayout && isMapExpanded && (
        <SafeAreaView
          pointerEvents="box-none"
          edges={['top']}
          style={[tw('absolute top-0 left-0 right-0 bottom-0'), { alignItems: 'flex-end' }]}
        >
          <TouchableOpacity
            onPress={() => isMapExpandedSet(false)}
            style={[
              tw('mr-3 mt-2 bg-icon-container-secondary rounded-full w-10 h-10 justify-center items-center shadow-md'),
              { zIndex: 10 },
            ]}
            activeOpacity={0.8}
          >
            <IconChevronDown color="#77838F" />
          </TouchableOpacity>
        </SafeAreaView>
      )}

      {/* ── 초기 로딩 오버레이 ── */}
      {!isMapPositioned && <SimpleLoading title="위치를 확인하는 중..." />}

      <MeasureEndModal
        visible={phase === 'ended'}
        onClose={handleCloseModal}
      />
    </View>
  );
}
