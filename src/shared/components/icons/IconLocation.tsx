import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconLocationProps {
  color?: string;
  width?: number;
  height?: number;
}

const IconLocation = ({
  color = '#01DA86',
  width = 28,
  height = 28,
}: IconLocationProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.00108686 12.3546C-0.0204811 11.8361 0.280594 11.3582 0.757608 11.1538L25.5063 0.54715C25.9761 0.345806 26.5212 0.450774 26.8826 0.812198C27.2441 1.17362 27.349 1.71868 27.1477 2.18848L16.5411 26.9372C16.3366 27.4142 15.8587 27.7153 15.3402 27.6937C14.8217 27.6722 14.3704 27.3324 14.2063 26.8401L11.3241 18.1936L19.6339 9.88385C20.122 9.3957 20.122 8.60424 19.6339 8.11609C19.1457 7.62793 18.3543 7.62793 17.8661 8.11609L9.58393 16.3983L0.854722 13.4885C0.362379 13.3244 0.0226548 12.8732 0.00108686 12.3546Z"
        fill={color}
      />
    </Svg>
  );
};

export default React.memo(IconLocation);
