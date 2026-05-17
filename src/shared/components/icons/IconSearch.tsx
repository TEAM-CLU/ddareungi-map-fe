import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconSearchProps {
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

const IconSearch = ({
  color = '#77838F',
  width = 20,
  height = 20,
  strokeWidth = 2,
}: IconSearchProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.5 15C12.0899 15 15 12.0899 15 8.5C15 4.91015 12.0899 2 8.5 2C4.91015 2 2 4.91015 2 8.5C2 12.0899 4.91015 15 8.5 15Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M13.5 13.5L18 18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default React.memo(IconSearch);
