import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconCheckProps {
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

const IconCheck = ({
  color = '#01DA86',
  width = 20,
  height = 20,
  strokeWidth = 2,
}: IconCheckProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default React.memo(IconCheck);
