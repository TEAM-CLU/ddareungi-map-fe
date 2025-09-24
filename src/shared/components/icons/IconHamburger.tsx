import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconHamburgerProps {
  color?: string;
  width?: number;
  height?: number;
}

const IconHamburger = ({
  color = '#01DA86',
  width = 20,
  height = 24,
}: IconHamburgerProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 24" fill="none">
      <Path
        d="M19.1667 10.9995H0.833333C0.373096 10.9995 0 11.4472 0 11.9995C0 12.5518 0.373096 12.9995 0.833333 12.9995H19.1667C19.6269 12.9995 20 12.5518 20 11.9995C20 11.4472 19.6269 10.9995 19.1667 10.9995Z"
        fill={color}
      />
      <Path
        d="M19.1667 4.00049H0.833333C0.373096 4.00049 0 4.4482 0 5.00049C0 5.55277 0.373096 6.00048 0.833333 6.00048H19.1667C19.6269 6.00048 20 5.55277 20 5.00049C20 4.4482 19.6269 4.00049 19.1667 4.00049Z"
        fill={color}
      />
      <Path
        d="M19.1667 18H0.833333C0.373096 18 0 18.4477 0 19C0 19.5523 0.373096 20 0.833333 20H19.1667C19.6269 20 20 19.5523 20 19C20 18.4477 19.6269 18 19.1667 18Z"
        fill={color}
      />
    </Svg>
  );
};

export default React.memo(IconHamburger);
