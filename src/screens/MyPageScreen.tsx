import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useBlockBackNavigation } from '@/shared/hooks/useBlockBackNavigation';
import { MYPAGE_SHOWING_CONTENTS } from '@/features/mypage/model/mypage.constants';
import { MypageShowingType } from '@/features/mypage/model/mypage.types';

const MyPageScreen = () => {
  const [whatShowing, setWhatShowing] = useState<MypageShowingType>('main');

  const mypageScreenDef = MYPAGE_SHOWING_CONTENTS[whatShowing];

  useBlockBackNavigation(true);

  const mypageRouter = useMemo(
    () => ({
      show: (type: MypageShowingType) => setWhatShowing(type),
      backToMain: () => setWhatShowing('main'),
    }),
    [setWhatShowing],
  );

  return (
    <View style={{ flex: 1 }}>{mypageScreenDef.render(mypageRouter)}</View>
  );
};

export default MyPageScreen;
