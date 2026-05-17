import { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';

interface BookmarkEditColorButtonProps {
  color: string;
  isSelected: boolean;
  onPress: (color: string) => void;
}
const BookmarkColorEditionButton = ({
  color,
  isSelected,
  onPress,
}: BookmarkEditColorButtonProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(color)}
      activeOpacity={0.8}
      style={[
        tw('items-center justify-center rounded-full'),
        isSelected
          ? {
              width: 40,
              height: 40,
              borderWidth: 2,
              borderColor: '#E5E7EB',
              padding: 3,
            }
          : { width: 36, height: 36 },
      ]}
    >
      <View
        style={[tw('w-full h-full rounded-full'), { backgroundColor: color }]}
      />
    </TouchableOpacity>
  );
};

export default memo(BookmarkColorEditionButton);
