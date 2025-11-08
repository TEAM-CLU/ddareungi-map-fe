import { getDistanceBetweenCoords } from '@/features/location/utils/location';
import { Coordinates } from '@/features/map/model/map.types';
import {
  MapAreaStationData,
  NearbyStationListPayload,
  NearbyStationData,
} from '@/features/station/model/station.types';
import { useNearbyStationsMutation } from '@/features/station/services/station.queries';
import { tw } from '@/shared/libs/tw-helper';
import { FocusOnTargetedNearbyStationMessage } from '@/shared/model/map.webview.types';
import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RefObject, use, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';

interface NearbyStationModalProps {
  myPosition: Coordinates | undefined;
  stationDetailModalRef: RefObject<BottomSheetModal | null>;
  setStationMetaData: React.Dispatch<
    React.SetStateAction<MapAreaStationData | null>
  >;
  nearByModalRef: RefObject<BottomSheetModal | null>;
  webRef: RefObject<WebView | null>;
  lamda: RefObject<number>;
}
const NearbyStationModal = ({
  myPosition,
  stationDetailModalRef,
  setStationMetaData,
  nearByModalRef,
  webRef,
  lamda,
}: NearbyStationModalProps) => {
  const { mutateAsync: getNearbyStations } = useNearbyStationsMutation();
  const [nearbyStationsDataList, setNearbyStationsDataList] = useState<
    NearbyStationData[] | null
  >(null);
  const [distances, setDistances] = useState<number[]>([]); // 거리 3개 배열

  // 리스트 클릭시 상세대여소 모달로 이동
  const handleStationItemBtnPress = async (
    stationMetaData: MapAreaStationData,
  ) => {
    await setStationMetaData(stationMetaData);
    try {
      const targetedNearbyStationData: FocusOnTargetedNearbyStationMessage = {
        type: 'focusOnTargetedNearbyStation',
        targetedStationData: stationMetaData,
      };
      webRef.current?.postMessage(JSON.stringify(targetedNearbyStationData));
    } catch (error) {
      console.error('Invalid JSON from WebView:', error);
    }

    await stationDetailModalRef.current?.present();
    await nearByModalRef.current?.dismiss();
  };

  // 내 위치 기반으로 주변 대여소 데이터 불러오는 로직
  useEffect(() => {
    const handleNearbyStations = async () => {
      if (!myPosition) return;
      try {
        const payload: NearbyStationListPayload = {
          latitude: myPosition.lat,
          longitude: myPosition.lon,
        };

        const response: NearbyStationData[] = await getNearbyStations(payload);
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
                      ? `${(
                          Math.round(distances[idx] * lamda.current) / 1000
                        ).toFixed(1)}km`
                      : `${Math.round(distances[idx] * lamda.current).toFixed(
                          0,
                        )}m`
                    : '거리 측정 중...'
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
