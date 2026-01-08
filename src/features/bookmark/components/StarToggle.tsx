import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { IconStar } from '@/shared/components/icons';

interface StarToggleProps {
  active?: boolean;
  onToggle: () => void;
}

const StarToggle = ({ active = false, onToggle }: StarToggleProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(1.3, {}, () => {
      scale.value = withSpring(1);
    });

    onToggle();
  };

  return (
    <Pressable onPress={handlePress}>
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

export default StarToggle;