import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconChevronDownProps {
  color?: string;
  width?: number;
  height?: number;
}

const IconChevronDown = ({
  color = '#01DA86',
  width = 24,
  height = 24,
}: IconChevronDownProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 9L12 15L6 9"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default React.memo(IconChevronDown);
