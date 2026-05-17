import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconDoubleTriangleProps {
  color?: string;
  width?: number;
  height?: number;
}

const IconDoubleTriangle = ({
  color = '#01DA86',
  width = 9,
  height = 9,
}: IconDoubleTriangleProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 9 9" fill="none">
      <Path d="M4.5 0L8.39711 3.75H0.602886L4.5 0Z" fill={color} />
      <Path d="M4.5 9L8.39711 5.25H0.602886L4.5 9Z" fill={color} />
    </Svg>
  );
};

export default React.memo(IconDoubleTriangle);
