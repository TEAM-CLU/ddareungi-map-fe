import React, { memo } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { IconStar } from '@/shared/components/icons';

interface BookmarkToggleProps {
  active?: boolean;
  onToggle: () => void;
}

const BookmarkToggle = ({ active = false, onToggle }: BookmarkToggleProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggleStarPress = () => {
    scale.value = withSpring(1.3, {}, () => {
      scale.value = withSpring(1);
    });

    onToggle();
  };

  return (
    <Pressable
      onPress={handleToggleStarPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Animated.View style={animatedStyle}>
        <IconStar
          width={24}
          height={23}
          strokeWidth={1.5}
          strokeColor={active ? 'transparent' : '#A7A7A7'}
          fillColor={active ? '#01DA86' : 'transparent'}
        />
      </Animated.View>
    </Pressable>
  );
};

export default memo(BookmarkToggle);
