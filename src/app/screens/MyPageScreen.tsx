import React, { useState } from 'react';
import { View } from 'react-native';
import EditProfile from '@/features/mypage/components/EditProfile';
import MypageMain from '@/features/mypage/components/main/MypageMain';
import OnboardingScreen from './OnboardingScreen';

type PageType = 'main' | 'updateInfo' | 'updatePassword' | 'help';

const MyPageScreen = () => {
  const [page, setPage] = useState<PageType>('main');

  const renderContent = () => {
    switch (page) {
      case 'updateInfo':
        return <EditProfile onBack={() => setPage('main')} />;
      // case 'updatePassword':
      // return <ChangePassword onBack={() => setPage('main')} />;
      // return <PwdResetContainer />;
      case 'help':
        return <OnboardingScreen onFinish={() => setPage('main')} buttonLabel='돌아가기' />;
      default:
        return <MypageMain onNavigate={setPage} />;
    }
  };

  return <View style={{ flex: 1 }}>{renderContent()}</View>;
};

export default MyPageScreen;
