import React, { useRef, useEffect } from 'react';
import { View, Alert, Platform } from 'react-native';
import WebView from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const TestScreenForCho = () => {
  const webRef = useRef<WebView>(null);

  // 위치 권한 요청
  const requestLocationPermission = async () => {
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      });

      if (!permission) return false;

      const result = await check(permission);

      if (result === RESULTS.GRANTED) {
        return true;
      }

      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    } catch (error) {
      console.error('권한 요청 실패:', error);
      return false;
    }
  };

  // 내 위치 가져오기
  const getMyLocation = (): Promise<{
    lat: number;
    lng: number;
    accuracy?: number;
  }> => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        ({ coords }) =>
          resolve({
            lat: coords.latitude,
            lng: coords.longitude,
            accuracy: coords.accuracy,
          }),
        reject,
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
      );
    });
  };

  // 위치 추적 시작
  const startLocationTracking = async () => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      Alert.alert('권한 필요', '위치 권한이 필요합니다.');
      return;
    }

    try {
      // 초기 위치 설정
      const loc = await getMyLocation();
      webRef.current?.postMessage(
        JSON.stringify({
          type: 'setMyLocation',
          lat: loc.lat,
          lng: loc.lng,
          accuracy: loc.accuracy,
        }),
      );

      // 위치 계속 추적
      const watchId = Geolocation.watchPosition(
        ({ coords }) => {
          webRef.current?.postMessage(
            JSON.stringify({
              type: 'setMyLocation',
              lat: coords.latitude,
              lng: coords.longitude,
              accuracy: coords.accuracy,
            }),
          );
        },
        error => console.warn('위치 추적 에러:', error),
        { enableHighAccuracy: true, distanceFilter: 5 }, // 5m 이상 이동 시 업데이트
      );

      // 컴포넌트 언마운트 시 추적 중단
      return () => {
        Geolocation.clearWatch(watchId);
      };
    } catch (error) {
      console.error('위치 가져오기 실패:', error);
      Alert.alert('오류', '위치를 가져올 수 없습니다.');
    }
  };

  // WebView 로드 완료 시 위치 추적 시작
  useEffect(() => {
    const cleanup = startLocationTracking();
    return () => {
      cleanup?.then(fn => fn?.());
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webRef}
        source={{
          uri: 'https://f43f9c8fc97d.ngrok-free.app/dev/ddareungi-map-fe/map.html',
        }}
        onMessage={event => {
          // WebView에서 메시지 받기 (필요시)
          console.log('WebView 메시지:', event.nativeEvent.data);
        }}
        onLoadEnd={() => {
          console.log('✅ WebView 로드 완료');
        }}
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          console.error('❌ WebView 에러:', nativeEvent);
        }}
      />
    </View>
  );
};

export default TestScreenForCho;
