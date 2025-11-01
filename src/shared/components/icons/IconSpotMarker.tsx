import React from 'react';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

interface IconSpotMarkerProps {
  color?: string; // 외곽 색상
  innerColor?: string; // 내부 원 색상
  width?: number;
  height?: number;
  label?: string; // 중앙에 표시할 텍스트
  textColor?: string; // 텍스트 색
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
}

const IconSpotMarker = ({
  color = '#01DA86',
  innerColor = 'white',
  width = 27,
  height = 32,
  label = '',
  textColor = '#FFF',
  fontSize = 8,
  fontWeight = '500',
  fontFamily = 'Pretendard',
}: IconSpotMarkerProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 27 32" fill="none">
      {/* Outer shape */}
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26.1818 13.0909C26.1818 23.2727 13.0909 32 13.0909 32C13.0909 32 0 23.2727 0 13.0909C0 5.861 5.861 0 13.0909 0C20.3208 0 26.1818 5.861 26.1818 13.0909Z"
        fill={color}
      />

      {/* Center text */}
      {label ? (
        <SvgText
          x="13.1"
          y="13.4"
          fill={textColor}
          fontSize={fontSize}
          fontWeight={fontWeight as any}
          fontFamily={fontFamily}
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {label}
        </SvgText>
      ) : null}
    </Svg>
  );
};

export default IconSpotMarker;
