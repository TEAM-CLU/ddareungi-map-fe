import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface IconUserDirectionProps {
  color?: string;
  width?: number;
  height?: number;
}

const IconUserDirection = ({
  color = '#01DA86',
  width = 48,
  height = 48,
}: IconUserDirectionProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 48 48" fill="none">
      <G transform="rotate(45 24 24)">
        <Path
          d="M25.5849 36.6608L27.4432 29.8468C27.59 29.3084 27.6635 29.0393 27.8512 28.8515C28.039 28.6637 28.3082 28.5903 28.8465 28.4435L35.6605 26.5851C38.0685 25.9284 39.2724 25.6 39.311 24.8787C39.3495 24.1573 38.1874 23.7026 35.8631 22.7931L17.0048 15.4138C15.1797 14.6996 14.2672 14.3425 13.8047 14.805C13.3423 15.2674 13.6994 16.18 14.4135 18.005L21.7928 36.8633C22.7023 39.1876 23.1571 40.3497 23.8784 40.3112C24.5998 40.2727 24.9282 39.0687 25.5849 36.6608Z"
          fill={color}
        />
      </G>
    </Svg>
  );
};

export default IconUserDirection;
