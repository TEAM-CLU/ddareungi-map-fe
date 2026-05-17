import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import { IconBackArrow } from '../icons';

interface BackButtonProps {
  type: 'previous' | 'custom';
  iconColor: 'brand' | 'gray';
  iconWidth?: number;
  iconHeight?: number;
  onPress?: () => void;
}

const BackButton = ({
  type,
  iconColor,
  iconWidth = 11,
  iconHeight = 20,
  onPress,
}: BackButtonProps) => {
  const { navigation } = useAppNavigation();

  const handlePress = () => {
    if (type === 'previous') {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      } else {
        navigation.navigate('Map');
        return;
      }
    }

    if (type === 'custom' && onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <IconBackArrow color={iconColor} width={iconWidth} height={iconHeight} />
    </TouchableOpacity>
  );
};

export default BackButton;
