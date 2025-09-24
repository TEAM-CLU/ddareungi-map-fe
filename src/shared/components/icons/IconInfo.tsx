import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconInfoProps {
  color?: string;
  width?: number;
  height?: number;
}

const IconInfo = ({
  color = '#01DA86',
  width = 28,
  height = 28,
}: IconInfoProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 0.25C6.40608 0.25 0.25 6.40608 0.25 14C0.25 21.5939 6.40608 27.75 14 27.75C21.5939 27.75 27.75 21.5939 27.75 14C27.75 6.40608 21.5939 0.25 14 0.25ZM12.75 9.83331V22.3333H15.25V9.83331H12.75ZM12.75 8.44444V5.66666H15.25V8.44444H12.75Z"
        fill={color}
      />
    </Svg>
  );
};

export default React.memo(IconInfo);
