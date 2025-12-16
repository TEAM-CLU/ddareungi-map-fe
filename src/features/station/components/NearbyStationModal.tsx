import { getDistanceBetweenCoords } from '@/features/location/utils/location';
import {
  MapAreaStationData,
  NearbyStationListPayload,
  NearbyStationData,
} from '@/features/station/model/station.types';
import { useNearbyStationsMutation } from '@/features/station/services/station.queries';
import { tw } from '@/shared/libs/tw-helper';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useStationStore } from '../stores/useStationStore';
import { useStationMessenger } from '@/features/station/hooks/useStationMessenger';

const NearbyStationModal = () => {
  const { mutateAsync: getNearbyStations } = useNearbyStationsMutation();
  const [distances, setDistances] = useState<number[]>([]); // 거리 3개 배열
  const { setShowStationDetailModal, setShowNearByStationModal } =
    useModalStore();
  const {
    setStationMetaData,
    nearbyStationDataList,
    setNearbyStationDataList,
    lamda,
  } = useStationStore();
  const { myPosition } = useMyPositionStore();
  const { focusOnTargetedNearbyStation } = useStationMessenger();

  // 리스트 클릭시 상세대여소 모달로 이동
  const handleStationItemBtnPress = (stationMetaData: MapAreaStationData) => {
    setStationMetaData(stationMetaData);
    focusOnTargetedNearbyStation(stationMetaData);
    setShowNearByStationModal(false);
    setShowStationDetailModal(true);
  };

  // 내 위치 기반으로 주변 대여소 데이터 불러오는 로직
  useEffect(() => {
    const handleNearbyStations = async () => {
      if (!myPosition) return;
      try {
        const payload: NearbyStationListPayload = {
          latitude: myPosition.lat,
          longitude: myPosition.lng,
        };

        const response: NearbyStationData[] = await getNearbyStations(payload);
        setNearbyStationDataList(response);
      } catch (error) {
        console.error('Error fetching nearby stations:', error);
      }
    };

    handleNearbyStations();
  }, [myPosition]);

  useEffect(() => {
    if (!myPosition || !nearbyStationDataList) return;
    const newDistances = nearbyStationDataList.map(station =>
      getDistanceBetweenCoords(
        { lat: myPosition.lat, lng: myPosition.lng },
        { lat: station.latitude, lng: station.longitude },
      ),
    );
    setDistances(newDistances.map(distance => Math.round(distance)));
  }, [myPosition, nearbyStationDataList]);

  if (!nearbyStationDataList)
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
      {nearbyStationDataList.map((nearbyStationData, idx) => {
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
                {`${
                  distances[idx]
                    ? distances[idx] >= 1000
                      ? `${(Math.round(distances[idx] * lamda) / 1000).toFixed(
                          1,
                        )}km`
                      : `${Math.round(distances[idx] * lamda).toFixed(0)}m`
                    : '거리를 계산 중이에요'
                }`}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
export default NearbyStationModal;
