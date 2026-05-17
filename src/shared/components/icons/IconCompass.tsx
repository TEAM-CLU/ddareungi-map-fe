import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconCompassProps {
  color?: string;
  width?: number;
  height?: number;
}

const IconCompass = ({
  color = '#77838F',
  width = 20,
  height = 20,
}: IconCompassProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.7337 0.266293C19.9966 0.529147 20.0729 0.925551 19.9265 1.26723L12.1343 19.449C11.9856 19.796 11.638 20.0149 11.2609 19.9992C10.8838 19.9836 10.5556 19.7365 10.4363 19.3784L7.9826 12.0174L0.621616 9.56377C0.263549 9.44441 0.0164762 9.11622 0.000790437 8.73911C-0.0148952 8.362 0.204069 8.01442 0.550988 7.86574L18.7328 0.0735311C19.0745 -0.0729011 19.4709 0.00343932 19.7337 0.266293ZM3.46496 8.59502L8.98879 10.4363C9.26024 10.5268 9.47326 10.7398 9.56374 11.0113L11.405 16.5351L17.3601 2.63998L3.46496 8.59502Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.2793 2.00659L9.2793 12.0066L7.99365 10.7209L17.9937 0.720945L19.2793 2.00659Z"
        fill={color}
      />
    </Svg>
  );
};

export default React.memo(IconCompass);
