import { DIRECTION_ICONS } from '@/features/navigation/model/navigation.constants';
import { tw } from '@/shared/libs/tw-helper';
import { useEffect, useState } from 'react';
import { Image, ImageStyle, Text, View } from 'react-native';

interface InstructionBannerProps {
  instruction: string;
  sign: number;
}
const InstructionBanner = ({ instruction, sign }: InstructionBannerProps) => {
  const [instructionLines, setInstructionLines] = useState<string[]>([]);

  useEffect(() => {
    // 단어 기준으로 n개마다 배열로 나누기
    const splitAfterWords = (text: string, n: number) => {
      const words = text.split(' ');
      const splittedResult = [];
      for (let i = 0; i < words.length; i += n) {
        splittedResult.push(words.slice(i, i + n).join(' '));
      }
      setInstructionLines(splittedResult);
      return;
    };
    splitAfterWords(instruction, 3);
  }, [instruction, sign]);

  return (
    <View
      style={[
        tw('w-full flex flex-row items-center px-5 py-4 bg-brand-primary'),
        { borderRadius: 20, maxWidth: 348, height: 70, gap: 15 },
      ]}
    >
      <Image
        source={DIRECTION_ICONS[String(sign) as keyof typeof DIRECTION_ICONS]}
        style={{ width: 50, height: 50 } as ImageStyle}
        resizeMode="cover"
      />
      <View style={[tw('flex flex-col justify-center'), { gap: 2 }]}>
        {instructionLines.map((instructionLine, idx) => {
          return (
            <Text
              key={idx}
              style={[
                tw('font-primary-700 text-on-surface-secondary '),
                { fontSize: 20 },
              ]}
            >
              {instructionLine}
            </Text>
          );
        })}
      </View>
    </View>
  );
};
export default InstructionBanner;
