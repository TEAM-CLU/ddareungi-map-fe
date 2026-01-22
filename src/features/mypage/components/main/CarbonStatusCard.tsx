import { tw } from '@/shared/libs/tw-helper';
import React from 'react';
import { Image, ImageStyle, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface CarbonStatusCardProps {
  carbonReduction: number | null;
  plantingTrees: number | null;
}

const CarbonStatusCard = ({
  carbonReduction,
  plantingTrees,
}: CarbonStatusCardProps) => {
  const carbon = carbonReduction ?? 0;
  const trees = plantingTrees ?? 0;

  return (
    <View
      style={[
        tw(
          'w-full h-[242px] border border-brand-primary bg-surface-primary shadow-sm rounded-xl overflow-hidden',
        ),
      ]}
    >
      <LinearGradient
        colors={['#FFFFFF', '#CFFBEA']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={tw('w-full h-[242px] justify-center items-center px-5 py-4')}
      >
        {/* 상단 텍스트 */}
        <View style={tw('w-full items-start')}>
          <Text style={tw('font-primary-700 text-lg text-on-surface-primary')}>
            지금까지 나의 탄소 발자국
          </Text>
        </View>

        {/* 나무 이미지 */}
        <Image
          source={require('@/assets/imgs/co2Tree.png')}
          style={tw('w-48 h-32') as ImageStyle}
          resizeMode="contain"
        />
      </LinearGradient>

      {/* 하단 정보 영역 */}
      <View
        style={tw(
          'flex-row bg-surface-primary border-t border-brand-primary px-8 py-4 justify-around',
        )}
      >
        {/* 탄소저감량 */}
        <View style={tw('items-center')}>
          <Text style={tw('text-on-surface-primary font-primary-600 text-sm')}>
            탄소저감량
          </Text>
          <Text style={tw('text-brand-primary font-primary-700 text-2xl mt-2')}>
            {carbon}KG
          </Text>
        </View>

        {/* 구분선 */}
        <View
          style={[tw('h-full'), { backgroundColor: '#D8D8D8', width: 1 }]}
        />

        {/* 심은 나무수 */}
        <View style={tw('items-center')}>
          <Text style={tw('text-on-surface-primary font-primary-600 text-sm')}>
            심은 나무수
          </Text>
          <Text style={tw('text-brand-primary font-primary-700 text-2xl mt-2')}>
            {trees}그루
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CarbonStatusCard;
