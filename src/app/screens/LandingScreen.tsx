import { tw } from '@/shared/libs/tw-helper';
import { View, Text } from 'react-native';

const LandingScreen = () => {
  return (
    <View style={tw('flex-1 items-center justify-center')}>
      <Text style={tw('text-yellow-400 text-2xl font-bold')}>Landing</Text>
      <View style={tw('w-32 h-32 bg-brand-primary')}></View>
    </View>
  );
};

export default LandingScreen;
