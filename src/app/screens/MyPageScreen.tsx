import React, { useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import EditProfile from '@/features/mypage/components/EditProfile';
import MypageMain from '@/features/mypage/components/main/MypageMain';
import PwdResetContainer from '@/features/auth/components/pwdReset/PwdResetContainer';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PageType = 'main' | 'updateInfo' | 'updatePassword' | 'help';

const MyPageScreen = () => {
  const [page, setPage] = useState<PageType>('main');

  // 개발용 초기화 함수
  const handleResetAll = async () => {
    try {
      // 1. 모든 저장소 비우기
      await AsyncStorage.clear();

      Alert.alert('초기화 완료! 앱을 껐다 켜주세요.');
    } catch (e) {
      console.error(e);
    }
  };

  const renderContent = () => {
    switch (page) {
      case 'updateInfo':
        return <EditProfile onBack={() => setPage('main')} />;
      // case 'updatePassword':
      // return <ChangePassword onBack={() => setPage('main')} />;
      // return <PwdResetContainer />;
      default:
        return <MypageMain onNavigate={setPage} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderContent()}
      <View style={{ marginTop: 50, padding: 20, backgroundColor: '#f0f0f0' }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
          🛠 개발자 메뉴
        </Text>
        <Button
          title="모든 데이터 초기화 (처음으로)"
          onPress={handleResetAll}
          color="red"
        />
      </View>
    </View>
  );
};

export default MyPageScreen;
