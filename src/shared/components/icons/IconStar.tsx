import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconStarProps {
  width?: number;
  height?: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

const IconStar = ({
  width = 24,
  height = 23,
  fillColor = 'white',
  strokeColor = '#A7A7A7',
  strokeWidth = 1.5,
}: IconStarProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 23" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.1731 2.39291C13.4614 0.202372 10.3623 0.202356 9.65056 2.39291L8.11213 7.12771H3.13366C0.830397 7.12771 -0.127274 10.0751 1.73612 11.4289L5.76379 14.3552L4.22536 19.09C3.51361 21.2805 6.02077 23.1021 7.88416 21.7483L11.9118 18.822L15.9395 21.7483C17.8029 23.1021 20.3101 21.2805 19.5983 19.09L18.0599 14.3552L22.0875 11.4289C23.9509 10.0751 22.9933 7.12771 20.69 7.12771L15.7115 7.12771L14.1731 2.39291Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default React.memo(IconStar);
