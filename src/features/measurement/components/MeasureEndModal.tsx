import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { tw } from '@/shared/libs/tw-helper';
import { IconClose, IconShared } from '@/shared/components/icons';
import SimpleLoading from '@/shared/components/SimpleLoading';
import {
  formatTimeHMSText,
  formatCaloriesKcalText,
  formatDistanceAdaptiveText,
} from '@/shared/utils/formatting';
import { convertToTrees } from '@/shared/utils/measure';
import { measureCarbonSaved } from '@/shared/utils/measure';
import {
  useUpdateUserStatsMutation,
  useUserInfoQuery,
} from '@/features/auth/services/user.queries';
import { UpdateUserStatsPayload } from '@/features/auth/model/user.types';
import StoryShareScreen from '@/features/navigation/components/StoryShareScreen';
import { useMeasurementStore } from '../stores/useMeasurementStore';
import { formatPace } from '../utils/formatPace';

interface MeasureEndModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function MeasureEndModal({
  visible,
  onClose,
}: MeasureEndModalProps) {
  const { sessionResult } = useMeasurementStore();
  const { data: prevUserInfo, isLoading } = useUserInfoQuery();
  const { mutate: updateUserStats } = useUpdateUserStatsMutation();
  const [showShare, setShowShare] = useState(false);
  const hasUpdatedStatsRef = React.useRef(false);

  useEffect(() => {
    if (!visible || !sessionResult || !prevUserInfo || hasUpdatedStatsRef.current)
      return;
    hasUpdatedStatsRef.current = true;
    const carbonSaved = measureCarbonSaved(
      'biking',
      sessionResult.traveledDistanceMeter,
    );
    const payload: UpdateUserStatsPayload = {
      statsInfo: {
        totalDistance:
          prevUserInfo.data.totalDistance + sessionResult.traveledDistanceMeter,
        totalTime: prevUserInfo.data.totalTime + sessionResult.elapsedTimeSeconds,
        calories: prevUserInfo.data.calories + sessionResult.caloriesBurned,
        plantingTree:
          prevUserInfo.data.treesPlanted + convertToTrees(carbonSaved),
        carbonReduction: prevUserInfo.data.carbonReduction + carbonSaved,
      },
    };
    updateUserStats(payload, { onError: () => {} });
  }, [visible, sessionResult, prevUserInfo, updateUserStats]);

  useEffect(() => {
    if (!visible) hasUpdatedStatsRef.current = false;
  }, [visible]);

  const handleSharePress = () => {
    setShowShare(true);
  };

  const handleShareClose = () => {
    setShowShare(false);
    onClose();
  };

  if (showShare && sessionResult) {
    return (
      <StoryShareScreen
        traveledDistance={sessionResult.traveledDistanceMeter}
        seconds={sessionResult.elapsedTimeSeconds}
        calories={sessionResult.caloriesBurned}
        onClose={handleShareClose}
      />
    );
  }

  if (!visible) return null;

  if (isLoading || !sessionResult) {
    return (
      <Modal isVisible={visible} style={tw('m-0 justify-center items-center')}>
        <SimpleLoading title="결과 저장 중" />
      </Modal>
    );
  }

  return (
    <Modal
      isVisible={visible}
      backdropOpacity={0.3}
      animationIn="fadeInUp"
      animationOut="fadeOutDown"
      useNativeDriver
      style={[tw('justify-center items-center flex'), { gap: 16 }]}
    >
      <View
        style={[
          tw('flex flex-col items-center justify-center w-full'),
          { gap: 16 },
        ]}
      >
        {/* 카드: NavigationEndModal과 동일 구조 (shadow-md, gap 50, maxWidth 273) */}
        <View
          style={[
            tw(
              'relative w-full flex flex-col items-start justify-between px-6 border border-brand-primary shadow-md rounded-xl bg-surface-primary',
            ),
            { gap: 50, maxWidth: 273, paddingVertical: 45 },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            style={[tw('absolute top-3 right-3')]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconClose color="#01DA86" />
          </TouchableOpacity>

          <View
            style={[
              tw('flex flex-col items-start justify-center'),
              { gap: 8 },
            ]}
          >
            <Text
              style={[
                tw('font-primary-700 text-on-surface-primary'),
                { fontSize: 24 },
              ]}
            >
              측정을 종료했습니다
            </Text>
          </View>

          <View
            style={[
              tw('flex flex-col items-start justify-start'),
              { gap: 6 },
            ]}
          >
            <Text
              style={[
                tw('font-primary-600 text-on-surface-primary'),
                { fontSize: 16 },
              ]}
            >
              소요시간: {formatTimeHMSText(sessionResult.elapsedTimeSeconds)}
            </Text>
            <Text
              style={[
                tw('font-primary-600 text-on-surface-primary'),
                { fontSize: 16 },
              ]}
            >
              이동 거리:{' '}
              {formatDistanceAdaptiveText(sessionResult.traveledDistanceMeter)}
            </Text>
            <Text
              style={[
                tw('font-primary-600 text-on-surface-primary'),
                { fontSize: 16 },
              ]}
            >
              평균 페이스:{' '}
              {formatPace(sessionResult.averagePaceMinutesPerKm)}/km
            </Text>
            <Text
              style={[
                tw('font-primary-600 text-on-surface-primary'),
                { fontSize: 16 },
              ]}
            >
              소모 칼로리: {formatCaloriesKcalText(sessionResult.caloriesBurned)}
            </Text>
            <Text
              style={[
                tw('font-primary-600 text-on-surface-primary'),
                { fontSize: 16 },
              ]}
            >
              최고 속도: {sessionResult.maxSpeedKmh.toFixed(1)} km/h
            </Text>
          </View>

          <Text
            style={[
              tw('font-primary-600 text-brand-primary'),
              { fontSize: 20 },
            ]}
          >
            총{' '}
            {formatDistanceAdaptiveText(sessionResult.traveledDistanceMeter)}{' '}
            이동했어요!
          </Text>
        </View>

        {/* 공유 버튼: 카드 밖, NavigationEndModal과 동일 */}
        <TouchableOpacity
          onPress={handleSharePress}
          style={tw(
            'rounded-full w-10 h-10 flex justify-center items-center shadow-md bg-surface-primary',
          )}
        >
          <IconShared color="#77838F" width={22} height={22} />
        </TouchableOpacity>

      </View>
    </Modal>
  );
}
