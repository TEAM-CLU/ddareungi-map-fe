import { getDistanceBetweenCoords } from '@/features/location/utils/location';
import { Coordinates } from '@/features/map/model/map.types';
import {
  MapAreaStationsData,
  NearbyStationsData,
  NearbyStationsPayload,
  NearbyStationsResponse,
} from '@/features/station/model/station.types';
import { useNearbyStationsMutation } from '@/features/station/services/station.queries';
import { tw } from '@/shared/libs/tw-helper';
import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RefObject, use, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';

interface NearbyStationModalProps {
  myPosition: Coordinates | undefined;
  stationDetailModalRef: RefObject<BottomSheetModal | null>;
  setStationMetaData: React.Dispatch<
    React.SetStateAction<MapAreaStationsData | null>
  >;
  nearByModalRef: RefObject<BottomSheetModal | null>;
}
const NearbyStationModal = ({
  myPosition,
  stationDetailModalRef,
  setStationMetaData,
  nearByModalRef,
}: NearbyStationModalProps) => {
  const { mutateAsync: getNearbyStations } = useNearbyStationsMutation();
  const [nearbyStationsDataList, setNearbyStationsDataList] = useState<
    NearbyStationsData[] | null
  >(null);
  const [distances, setDistances] = useState<number[]>([]); // 거리 3개 배열

  // 리스트 클릭시 상세대여소 모달로 이동
  const handleStationItemButtonPress = async (
    stationMetaData: MapAreaStationsData,
  ) => {
    await setStationMetaData(stationMetaData);
    await stationDetailModalRef.current?.present();
    await nearByModalRef.current?.dismiss();
  };

  // 내 위치 기반으로 주변 대여소 데이터 불러오는 로직
  useEffect(() => {
    const handleNearbyStations = async () => {
      if (!myPosition) return;
      try {
        const payload: NearbyStationsPayload = {
          latitude: myPosition.lat,
          longitude: myPosition.lon,
        };

        const response: NearbyStationsData[] = await getNearbyStations(payload);
        setNearbyStationsDataList(response);
      } catch (error) {
        console.error('Error fetching nearby stations:', error);
      }
    };

    handleNearbyStations();
  }, [myPosition]);

  useEffect(() => {
    if (!myPosition || !nearbyStationsDataList) return;
    const newDistances = nearbyStationsDataList.map(station =>
      getDistanceBetweenCoords(
        { lat: myPosition.lat, lon: myPosition.lon },
        { lat: station.latitude, lon: station.longitude },
      ),
    );
    setDistances(newDistances.map(distance => Math.round(distance)));
  }, [myPosition, nearbyStationsDataList]);

  if (!nearbyStationsDataList)
    return (
      <View style={tw('flex justify-center w-full flex-1 items-center')}>
        <ActivityIndicator size="large" color="#01DA86" />
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
      {nearbyStationsDataList.map((nearbyStationData, idx) => {
        return (
          <TouchableOpacity
            onPress={() => handleStationItemButtonPress(nearbyStationData)}
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
                {`${distances[idx] ? distances[idx] + 'm' : '거리 측정 중...'}`}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
export default NearbyStationModal;
