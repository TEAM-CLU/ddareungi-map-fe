import { getDistanceBetweenCoords } from '@/features/location/utils/location';
import { MapAreaStationData } from '@/features/station/model/station.types';
import { tw } from '@/shared/libs/tw-helper';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useStationStore } from '../stores/useStationStore';
import { useStationMessenger } from '@/features/station/hooks/useStationMessenger';
import { useNearbyStationsQuery } from '../services/station.queries';
import { DISTANCE_LAMBDA } from '../model/station.constants';
import { useShallow } from 'zustand/react/shallow';
import { getDistanceGuideText } from '@/shared/utils/formatting';

const NearbyStationModal = () => {
  const locationMetaData = useMyPositionStore(state => state.locationMetaData);
  const myPosition = locationMetaData?.coordinate;

  const { data: nearbyStationDataList, isLoading } = useNearbyStationsQuery(
    myPosition?.lat,
    myPosition?.lng,
  );

  const { setShowStationDetailModal, setShowNearByStationModal } =
    useModalStore(
      useShallow(state => ({
        setShowStationDetailModal: state.setShowStationDetailModal,
        setShowNearByStationModal: state.setShowNearByStationModal,
      })),
    );
  const setStationMetaData = useStationStore(state => state.setStationMetaData);
  const { focusOnTargetedNearbyStation } = useStationMessenger();

  // 리스트 클릭시 상세대여소 모달로 이동
  const handleStationItemBtnPress = (stationMetaData: MapAreaStationData) => {
    setStationMetaData(stationMetaData);
    focusOnTargetedNearbyStation(stationMetaData);
    setShowNearByStationModal(false);
    setShowStationDetailModal(true);
  };

  // 2. useMemo로 거리 정보가 포함된 새로운 리스트 생성
  const stationsWithDistance = useMemo(() => {
    // 위치 정보나 데이터가 없으면 빈 배열 반환
    if (!myPosition || !nearbyStationDataList) return [];

    return nearbyStationDataList.map(station => {
      // 1. 직선 거리 계산
      const rawDist = getDistanceBetweenCoords(
        { lat: myPosition.lat, lng: myPosition.lng },
        { lat: station.latitude, lng: station.longitude },
      );

      // 2. lamda 보정 적용
      const adjustedDist = rawDist * DISTANCE_LAMBDA;

      return {
        ...station,
        calculatedDistance: adjustedDist, // 계산된 거리값 저장
      };
    });
  }, [myPosition, nearbyStationDataList, DISTANCE_LAMBDA]);

  if (isLoading || !nearbyStationDataList)
    return (
      <View style={tw('flex justify-center w-full flex-1 items-center')}>
        <ActivityIndicator size="large" color="#C4C4C4" />
      </View>
    );

  return (
    <View
      style={[
        tw('w-full flex flex-col justify-start items-start'),
        { gap: 20 },
      ]}
    >
      <Text
        style={[
          tw('font-primary-700 text-on-surface-primary text-left'),
          { fontSize: 19, marginBottom: 20 },
        ]}
      >
        내 주변에 있는 따릉이
      </Text>
      {stationsWithDistance.map(nearbyStationData => {
        return (
          <TouchableOpacity
            onPress={() => handleStationItemBtnPress(nearbyStationData)}
            key={nearbyStationData.number}
            style={[
              tw('w-full flex flex-col justify-start border-b pb-5'),
              { borderColor: '#0000001A' },
            ]}
          >
            <View
              style={tw('w-full flex flex-row justify-between items-center')}
            >
              <View style={[tw('flex flex-row '), { gap: 8 }]}>
                <View
                  style={[
                    tw(
                      'w-8 h-8 justify-center items-center bg-brand-primary rounded-full',
                    ),
                  ]}
                >
                  <Text
                    style={[
                      tw('font-primary-700 text-on-surface-secondary'),
                      { fontSize: 16 },
                    ]}
                  >
                    {nearbyStationData.current_bikes}
                  </Text>
                </View>
                <View style={[tw('flex flex-col items-start'), { gap: 4 }]}>
                  <Text
                    style={[
                      tw('font-primary-500 text-black text-left'),
                      { fontSize: 15 },
                    ]}
                  >
                    {nearbyStationData.name}
                  </Text>
                  <Text
                    style={[
                      tw('font-primary-600 text-on-surface-quaternary'),
                      { fontSize: 13 },
                    ]}
                  >
                    대여 가능 따릉이 {nearbyStationData.current_bikes}
                  </Text>
                </View>
              </View>
              <Text
                style={[tw('font-primary-500 text-black'), { fontSize: 15 }]}
              >
                {getDistanceGuideText(nearbyStationData.calculatedDistance)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
export default NearbyStationModal;
