import { IconBackArrow } from '@/shared/components/icons';
import { TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';

interface ReturnToRouteSelectButtonProps {
  onPress: () => void;
}
const ReturnToRouteSelectButton = ({
  onPress,
}: ReturnToRouteSelectButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        tw(
          'bg-icon-container-secondary relative rounded-full w-10 h-10 flex justify-center items-center shadow-md',
        ),
        { zIndex: 10 },
      ]}
    >
      <View style={{ position: 'absolute', right: 15 }}>
        <IconBackArrow color={'gray'} />
      </View>
    </TouchableOpacity>
  );
};
export default ReturnToRouteSelectButton;
