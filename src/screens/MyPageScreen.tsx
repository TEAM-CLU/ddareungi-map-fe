import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useBlockBackNavigation } from '@/shared/hooks/useBlockBackNavigation';
import { MYPAGE_SHOWING_CONTENTS } from '@/features/mypage/model/mypage.constants';
import { MypageShowingType } from '@/features/mypage/model/mypage.types';

const MypageScreen = () => {
  useBlockBackNavigation(true);

  const [whatShowing, setWhatShowing] = useState<MypageShowingType>('main');

  const mypageRouter = useMemo(
    () => ({
      show: (type: MypageShowingType) => setWhatShowing(type),
      backToMain: () => setWhatShowing('main'),
    }),
    [setWhatShowing],
  );

  const mypageScreenDef = MYPAGE_SHOWING_CONTENTS[whatShowing];

  return (
    <View style={{ flex: 1 }}>{mypageScreenDef.render(mypageRouter)}</View>
  );
};

export default MypageScreen;
