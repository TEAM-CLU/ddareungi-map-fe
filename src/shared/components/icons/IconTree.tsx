import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

interface IconTreeProps {
  color?: string;
  width?: number;
  height?: number;
}

const IconTree = ({
  color = '#FFFFFF',
  width = 12,
  height = 16,
}: IconTreeProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 8 12" fill="none">
      <G transform="translate(0, 0)">
        <Path
          d="M1.70711 3.29289L4 1L6.29289 3.29289C6.92286 3.92286 6.47669 5 5.58579 5H2.41421C1.52331 5 1.07714 3.92286 1.70711 3.29289Z"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <G transform="translate(0, 4)">
        <Path
          d="M6.90552 3.36133L6.52055 3.68039L6.52057 3.68042L6.90552 3.36133ZM6.13599 5L6.13599 5.5L6.13602 5.5L6.13599 5ZM1.09595 3.36133L1.48089 3.68042L1.48092 3.68039L1.09595 3.36133ZM3.05298 1V0.5C2.90412 0.5 2.763 0.566329 2.66801 0.680943L3.05298 1ZM4.94849 1L5.33346 0.680943C5.23847 0.566329 5.09735 0.5 4.94849 0.5V1ZM6.90552 3.36133L6.52057 3.68042C6.79103 4.00669 6.55873 4.49997 6.13595 4.5L6.13599 5L6.13602 5.5C7.40637 5.4999 8.10056 4.01953 7.29046 3.04224L6.90552 3.36133ZM6.13599 5V4.5H1.86548V5V5.5H6.13599V5ZM1.86548 5V4.5C1.44275 4.5 1.21038 4.00676 1.48089 3.68042L1.09595 3.36133L0.711003 3.04224C-0.0990676 4.0195 0.594976 5.5 1.86548 5.5V5ZM1.09595 3.36133L1.48092 3.68039L3.43795 1.31906L3.05298 1L2.66801 0.680943L0.710977 3.04227L1.09595 3.36133ZM3.05298 1V1.5H4.94849V1V0.5H3.05298V1ZM4.94849 1L4.56352 1.31906L6.52055 3.68039L6.90552 3.36133L7.29049 3.04227L5.33346 0.680943L4.94849 1Z"
          fill={color}
        />
      </G>
      <G transform="translate(3, 8)">
        <Path
          d="M1 1V3"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};

export default React.memo(IconTree);
