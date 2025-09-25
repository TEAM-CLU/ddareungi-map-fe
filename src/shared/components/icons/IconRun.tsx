import React from 'react';
import Svg, { Path, Defs, ClipPath, Rect, G } from 'react-native-svg';

interface IconRunProps {
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

const IconRun = ({
  color = 'white',
  width = 8,
  height = 8,
  strokeWidth = 0.7,
}: IconRunProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 8 8" fill="none">
      <G clipPath="url(#clip0)">
        <Path
          d="M5.66675 1.5C5.66675 1.77614 5.44289 2 5.16675 2C4.89061 2 4.66675 1.77614 4.66675 1.5C4.66675 1.22386 4.89061 1 5.16675 1C5.44289 1 5.66675 1.22386 5.66675 1.5Z"
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <Path
          d="M5 7.00002L4.77863 6.12804C4.70537 5.83945 4.55384 5.5759 4.34024 5.36555L3.83333 4.86637M2 3.71756C2.33333 3.06098 2.84589 2.68052 4 2.66688M4 2.66688C4.07288 2.66601 4.18146 2.66575 4.28995 2.66577C4.45823 2.6658 4.54237 2.66581 4.60941 2.69713C4.67645 2.72845 4.74521 2.81061 4.88272 2.97492C4.92212 3.02199 4.96258 3.06418 5 3.09223M4 2.66688L3.57697 3.31961C3.34439 3.67848 3.2281 3.85791 3.22356 4.04631C3.22154 4.13023 3.23539 4.21377 3.26438 4.29255C3.32945 4.46941 3.49741 4.60173 3.83333 4.86637M5 3.09223C5.38492 3.38087 5.98755 3.49711 6.66667 2.7328M5 3.09223L3.83333 4.86637"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M1.33325 5.91L1.55933 5.96379C2.13546 6.10086 2.73433 5.83874 2.99992 5.33325"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0">
          <Rect width="8" height="8" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default React.memo(IconRun);
