import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface IconPauseProps {
  color?: string;
  width?: number;
  height?: number;
}

const IconPause = ({
  color = '#01DA86',
  width = 48,
  height = 48,
}: IconPauseProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 48 48" fill="none">
      <Rect x="15" y="13" width="5" height="22" rx="1" fill={color} />
      <Rect x="27" y="13" width="5" height="22" rx="1" fill={color} />
    </Svg>
  );
};

export default IconPause;
