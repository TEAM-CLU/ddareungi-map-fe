import * as React from 'react';
import { SvgProps } from 'react-native-svg';
import KakaoSvg from '@/assets/svgs/kakao.svg';

interface IconKakaoProps extends SvgProps {
  size?: number;
}

const IconKakao = ({ size = 25, ...rest }: IconKakaoProps) => {
  return <KakaoSvg width={size} height={size} {...rest} />;
};

export default IconKakao;
