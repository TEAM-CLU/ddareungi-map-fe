import React from 'react';
import Svg, { Circle } from 'react-native-svg';

interface IconEclipseProps {
  color?: string;
  width?: number;
  height?: number;
}

const IconEclipse = ({
  color = '#A7A7A7',
  width = 4,
  height = 4,
}: IconEclipseProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 4 4" fill="none">
      <Circle
        cx="2"
        cy="2"
        r="1"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default IconEclipse;
