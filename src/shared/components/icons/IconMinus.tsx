import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconMinusProps {
  color?: string;
  width?: number;
  height?: number;
}

const IconMinus = ({
  color = '#77838F',
  width = 28,
  height = 4,
}: IconMinusProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 28 4" fill="none">
      <Path
        d="M2 2H26"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default IconMinus;
