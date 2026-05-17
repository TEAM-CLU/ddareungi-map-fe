import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconCloseProps {
  color?: string;
  width?: number;
  height?: number;
}

const IconClose = ({
  color = '#414548',
  width = 14,
  height = 14,
}: IconCloseProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
      <Path
        d="M13 1L1 13"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1 1L13 13"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default React.memo(IconClose);
