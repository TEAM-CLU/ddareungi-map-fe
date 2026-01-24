import { permissionAboutLocation } from '@/features/map/model/map.data';
import { Alert, Linking, BackHandler } from 'react-native';
import { check, RESULTS, request } from 'react-native-permissions';

// 위치 퍼미션 확인하기
export const hasLocationPermission = async () => {
  try {
    return (await check(permissionAboutLocation!)) === RESULTS.GRANTED;
  } catch (_) {
    Alert.alert('오류', '권한 확인 중 오류가 발생했습니다.');
    return false;
  }
};

// 권한 다이렉트 요청 (팝업으로 바로 허용/거부)
export const requestLocationPermission = async () => {
  try {
    // 1. 먼저 현재 상태 확인
    if (await hasLocationPermission()) {
      return true;
    }

    // 2. 권한 요청
    const result = await request(permissionAboutLocation!);

    if (result === RESULTS.GRANTED) {
      return true;
    }

    if (result === RESULTS.BLOCKED) {
      Alert.alert(
        '권한 설정',
        '앱을 사용하기 위해서는 위치 권한이 필요합니다. 설정으로 이동하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '설정으로 이동', onPress: () => Linking.openSettings() },
        ],
      );
      return false;
    }

    if (result === RESULTS.DENIED) {
      Alert.alert(
        '권한 거부',
        '위치 권한이 거부되었습니다. 앱을 사용하기 위해서는 위치 권한이 필요합니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '다시 시도', onPress: () => requestLocationPermission() },
        ],
      );
      return false;
    }

    if (result === RESULTS.LIMITED) {
      Alert.alert(
        '권한 제한',
        '위치 권한이 제한되었습니다. 앱을 사용하기 위해서는 위치 권한이 필요합니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '설정으로 이동', onPress: () => Linking.openSettings() },
        ],
      );
      return false;
    }

    if (result === RESULTS.UNAVAILABLE) {
      Alert.alert(
        '권한 없음',
        '이 기기에서는 위치 권한을 사용할 수 없습니다.',
        [{ text: '종료', onPress: () => BackHandler.exitApp() }],
      );
      return false;
    }

    return false;
  } catch (_) {
    Alert.alert('오류', '권한 요청 중 오류가 발생했습니다.', [
      { text: '취소', style: 'cancel' },
      { text: '설정으로 이동', onPress: () => Linking.openSettings() },
    ]);
    return false;
  }
};
