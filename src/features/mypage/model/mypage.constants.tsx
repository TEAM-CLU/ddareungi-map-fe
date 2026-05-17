import PwdResetContainer from '@/features/auth/components/pwdReset/PwdResetContainer';
import MypageMain from '@/features/mypage/components/main/MypageMain';
import ProfileEditor from '@/features/mypage/components/ProfileEditor';
import {
  MypageScreenDef,
  MypageShowingType,
} from '@/features/mypage/model/mypage.types';
import OnboardingScreen from '@/screens/OnboardingScreen';

export const MYPAGE_MENU_ITEMS = [
  { key: 'updateInfo', label: '내 정보 수정' },
  { key: 'updatePassword', label: '비밀번호 변경' },
  { key: 'help', label: '도움말' },
] as const;

export const MYPAGE_SHOWING_CONTENTS: Record<
  MypageShowingType,
  MypageScreenDef
> = {
  main: {
    blockBack: false,
    render: ({ show }) => <MypageMain onNavigate={show} />,
  },

  updateInfo: {
    blockBack: true,
    render: ({ backToMain }) => <ProfileEditor onBack={backToMain} />,
  },

  updatePassword: {
    blockBack: true,
    render: ({ backToMain }) => (
      <PwdResetContainer
        setAccountFeatures={() => {}}
        prevScreen="mypage"
        onDone={backToMain}
      />
    ),
  },

  help: {
    blockBack: true,
    render: ({ backToMain }) => (
      <OnboardingScreen onFinish={backToMain} buttonLabel="돌아가기" />
    ),
  },
} as const;
