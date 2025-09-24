import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconBackArrowProps {
  color: 'brand' | 'gray';
  width?: number;
  height?: number;
}

const IconBackArrow = ({
  color,
  width = 11,
  height = 20,
}: IconBackArrowProps) => {
  const fillColor =
    color === 'brand' ? '#01DA86' : color === 'gray' ? '#77838F' : '#77838F';

  return (
    <Svg width={width} height={height} viewBox="0 0 11 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.81775 0.100098L0.355137 9.11971C0.13067 9.33367 0 9.6576 0 10.0001C0 10.3426 0.13067 10.6665 0.355137 10.8805L9.81775 19.9001L11 18.1393L2.46102 10.0001L11 1.86088L9.81775 0.100098Z"
        fill={fillColor}
      />
    </Svg>
  );
};

export default React.memo(IconBackArrow);
