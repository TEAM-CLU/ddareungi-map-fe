import {
  UpdateUserPayload,
  UpdateUserStatsPayload,
} from '@/features/auth/model/auth.types';
import {
  useUpdateUserInfoMutation,
  useUpdateUserStatsMutation,
  useUserInfoQuery,
} from '@/features/auth/services/user.queries';
import { useNavigationMessenger } from '@/features/navigation/hooks/useNavigationMessenger';
import { clearSharedTimer } from '@/features/navigation/hooks/useTimer';
import { TTS_URL_PRESET } from '@/features/navigation/model/navigation.constants';
import { useTerminateNavigationSessionMutation } from '@/features/navigation/services/navigation.queries';
import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore';
import { useVolumeStore } from '@/features/navigation/stores/useVolumeStore';
import { playTts } from '@/features/navigation/libs/playTts';
import { useRouteSelect } from '@/features/routing/hooks/useRouteSelect';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { useSearchStore } from '@/features/search/stores/useSearchStore';
import { IconClose } from '@/shared/components/icons';
import SimpleLoading from '@/shared/components/SimpleLoading';
import { tw } from '@/shared/libs/tw-helper';
import { convertToTrees } from '@/shared/utils/measure';
import { useEffect } from 'react';
import { Image, ImageStyle, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { clearTtsQueue } from '@/features/navigation/libs/ttsPlayer';
import { useBookmarkMessenger } from '@/features/bookmark/hooks/useBookmarkMessenger';
import {
  formatTimeHMSText,
  formatCaloriesKcalText,
  formatDistanceAdaptiveText,
} from '@/shared/utils/formatting';

interface NavigationFinishModalProps {
  modalRef: React.RefObject<Modal | null>;
  setShowNavigationFinishModal: (show: boolean) => void;
  totalCaloriesBurned: number;
  totalCarbonSaved: number;
  seconds: number;
  traveledDistanceMeter: number | undefined | null;
  resetNavigationData: () => void;
  sessionId: string | null;
}

const NavigationFinishModal = ({
  modalRef,
  setShowNavigationFinishModal,
  totalCaloriesBurned,
  totalCarbonSaved,
  seconds,
  traveledDistanceMeter,
  resetNavigationData,
  sessionId,
}: NavigationFinishModalProps) => {
  const { data: prevUserInfo, isLoading } = useUserInfoQuery();
  const { mutateAsync: updateUserUsageInfo } = useUpdateUserStatsMutation();
  const { mutateAsync: terminateNavigationSession } =
    useTerminateNavigationSessionMutation();
  const { resetAllData: resetRouteData } = useRouteStore();
  const { resetAllData: resetSearchData } = useSearchStore();
  const { systemVolume } = useVolumeStore();
  const { replaceMyLocationMarker, clearNavigationPath } =
    useNavigationMessenger();
  const { turnOnBookmarkMarkers } = useBookmarkMessenger();

  useEffect(() => {
    const terminateNavigation = async () => {
      turnOnBookmarkMarkers();
      const finishTtsKey = 'tts-navigation-end';
      const finishTtsUrl = TTS_URL_PRESET.FINISH_TTS_URL;
      playTts(finishTtsKey, finishTtsUrl, systemVolume);
      if (sessionId === null || sessionId === '') return;
      try {
        const payload = {
          sessionId: sessionId,
        };
        await terminateNavigationSession(payload);
      } catch (error) {
        console.error('Failed to terminate navigation session:', error);
      }
    };
    clearNavigationPath();
    terminateNavigation();
  }, []);

  const handleCloseFinishModalPress = async () => {
    if (!prevUserInfo) {
      setShowNavigationFinishModal(false);
      clearSharedTimer();
      resetNavigationData();
      resetRouteData();
      resetSearchData();
      replaceMyLocationMarker(false);
      clearTtsQueue();
      return;
    }

    try {
      const payload: UpdateUserStatsPayload = {
        statsInfo: {
          totalDistance:
            prevUserInfo.data.totalDistance + (traveledDistanceMeter ?? 0),
          totalTime: prevUserInfo.data.totalTime + seconds,
          calories: prevUserInfo.data.calories + totalCaloriesBurned,
          plantingTree:
            prevUserInfo.data.treesPlanted + convertToTrees(totalCarbonSaved),
          carbonReduction: prevUserInfo.data.carbonReduction + totalCarbonSaved,
        },
      };

      await updateUserUsageInfo(payload);
      setShowNavigationFinishModal(false);
      clearSharedTimer();
      resetNavigationData();
      resetRouteData();
      resetSearchData();
      replaceMyLocationMarker(false);
      clearTtsQueue();
    } catch (error) {
      console.error('Failed to update user stats:', error);
    } finally {
      setShowNavigationFinishModal(false);
      clearSharedTimer();
      resetNavigationData();
      resetRouteData();
      resetSearchData();
      replaceMyLocationMarker(false);
      clearTtsQueue();
    }
  };

  return (
    <Modal
      ref={modalRef}
      isVisible={true}
      backdropOpacity={0.3}
      animationIn={'fadeInUp'}
      animationOut={'fadeOutDown'}
      useNativeDriver={true}
      style={tw('justify-center items-center flex')}
    >
      {isLoading ? (
        <SimpleLoading title="사용자 정보 조회중" />
      ) : (
        <View
          style={[
            tw(
              'relative w-full flex flex-col items-start justify-between px-6 border border-brand-primary shadow-md rounded-xl bg-surface-primary',
            ),
            { gap: 50, maxWidth: 273, paddingVertical: 45 },
          ]}
        >
          <TouchableOpacity
            onPress={handleCloseFinishModalPress}
            style={[tw('absolute top-3 right-3')]}
          >
            <IconClose color="#01DA86" />
          </TouchableOpacity>
          <View
            style={[tw('flex flex-col items-start justify-center'), { gap: 8 }]}
          >
            <Text
              style={[
                tw('font-primary-700 text-on-surface-primary'),
                { fontSize: 24 },
              ]}
            >
              {'드디어\u00A0'}
              <Text
                style={[
                  tw('font-primary-700 text-brand-primary'),
                  { fontSize: 24 },
                ]}
              >
                목적지
              </Text>
              에
            </Text>
            <Text
              style={[
                tw('font-primary-700 text-on-surface-primary'),
                { fontSize: 24 },
              ]}
            >
              도착했어요!
            </Text>
          </View>
          <View
            style={[tw('flex flex-col items-start justify-start'), { gap: 6 }]}
          >
            <Text
              style={[
                tw('font-primary-600 text-on-surface-primary'),
                { fontSize: 16 },
              ]}
            >
              소요시간: {formatTimeHMSText(seconds)}
            </Text>
            <Text
              style={[
                tw('font-primary-600 text-on-surface-primary'),
                { fontSize: 16 },
              ]}
            >
              탄소 저감량: {convertToTrees(totalCarbonSaved)}그루
            </Text>
            <Text
              style={[
                tw('font-primary-600 text-on-surface-primary'),
                { fontSize: 16 },
              ]}
            >
              소모 칼로리: {formatCaloriesKcalText(totalCaloriesBurned)}
            </Text>
          </View>
          <Text
            style={[
              tw('font-primary-600 text-brand-primary'),
              { fontSize: 20 },
            ]}
          >
            총 {formatDistanceAdaptiveText(traveledDistanceMeter ?? 0)}{' '}
            이동했어요!
          </Text>
          <Image
            source={require('@/assets/imgs/finishFlag.png')}
            style={
              {
                position: 'absolute',
                left: 110,
                bottom: 17,
                zIndex: -1,
              } as ImageStyle
            }
            resizeMode="cover"
          />
        </View>
      )}
    </Modal>
  );
};
export default NavigationFinishModal;
