import React, { useRef } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import SlideModal from '@/shared/components/modal/SlideModal';

const TestScreenForPark = () => {
  const slideModalRef = useRef<BottomSheetModal>(null);

  const handleOpenModalPress = () => {
    try {
      slideModalRef.current?.present();
    } catch (error) {
      Alert.alert('Error', 'Failed to open SlideModal.');
    }
  };

  const handleCloseModalPress = () => slideModalRef.current?.dismiss();

  return (
    <View style={tw('flex-1 items-center justify-center bg-surface-secondary')}>
      <TouchableOpacity
        onPress={handleOpenModalPress}
        style={tw('bg-brand-primary px-6 py-3 rounded-xl mb-4')}
      >
        <Text style={tw('text-white font-primary-700')}>
          모달 열기
        </Text>
      </TouchableOpacity>

      <SlideModal
        ref={slideModalRef}
        snapPoints={['35%', '60%']}
        onClose={handleCloseModalPress}
      >
        <View>
          <Text style={tw('text-xl font-primary-700 text-center mb-3')}>
            🗺️ 경로 상세 정보
          </Text>
          <Text
            style={tw('text-base font-primary-600 text-center text-gray-600')}
          >
            SlideModal을 사용하여 경로 추천, 정거장 목록, 사용자 설정 등의
            정보를 표시할 수 있습니다.
          </Text>
        </View>

        <View style={tw('bg-gray-100 p-4 rounded-lg mb-4')}>
          <Text style={tw('text-sm font-primary-600 text-gray-700')}>
            • 출발지: 강남역 1번 출구
          </Text>
          <Text style={tw('text-sm font-primary-600 text-gray-700')}>
            • 도착지: 서울시청 앞 정거장
          </Text>
          <Text style={tw('text-sm font-primary-600 text-gray-700')}>
            • 예상 시간: 15분
          </Text>
        </View>
      </SlideModal>
    </View>
  );
};

export default TestScreenForPark;
