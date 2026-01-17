import IconNorthIndicator from '@/shared/components/icons/IconNorthIndicator';
import { View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';

const NorthIndicator = () => {
  return (
    <View
      style={[
        tw(
          'bg-icon-container-secondary rounded-full w-10 h-10 flex justify-center items-center shadow-md',
        ),
        { zIndex: 10 },
      ]}
    >
      <IconNorthIndicator />
    </View>
  );
};

export default NorthIndicator;
