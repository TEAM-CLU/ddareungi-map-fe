import { tw } from '@/shared/libs/tw-helper';
import React from 'react';
import { TextStyle, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Spinner from 'react-native-loading-spinner-overlay';

interface SimpleLoadingProps {
  title: string;
}
const SimpleLoading = ({ title }: SimpleLoadingProps) => {
  return (
    <SafeAreaView style={tw('w-full flex-1 justify-center items-center')}>
      <Spinner
        visible={true}
        textContent={title}
        textStyle={tw('text-on-surface-secondary') as TextStyle}
        overlayColor="rgba(0, 0, 0, 0.7)"
        color="#01DA86"
      />
    </SafeAreaView>
  );
};

export default SimpleLoading;
