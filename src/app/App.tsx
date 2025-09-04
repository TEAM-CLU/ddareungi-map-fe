import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DevHub from '@/app/routes/DevHub';
import { tw } from '@/shared/libs/tw-helper';

const App = () => {
  return (
    <GestureHandlerRootView style={tw('flex-1')}>
      <DevHub />
    </GestureHandlerRootView>
  );
};

export default App;
