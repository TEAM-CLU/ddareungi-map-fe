import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';
import TreeBadge from '@/shared/components/badge/TreeBadge';
import { IconSpotMarker } from '@/shared/components/icons';
import { ScrollView } from 'react-native-gesture-handler';
import RouteProgressStepVerticalBar from '@/features/routing/components/RoutePrgressStepVerticalBar';
import RoundButton from '@/shared/components/button/RoundButton';

const RouteSelectDetailModal = () => {
  return (
    <ScrollView
      contentContainerStyle={[
        tw('w-full flex flex-col flex-1 bg-surface-primary justify-start'),
        { gap: 13 },
      ]}
    >
      <View style={[tw('flex flex-col items-start w-full'), { gap: 16 }]}>
        <Text
          style={[tw('font-primary-700 text-brand-primary'), { fontSize: 14 }]}
        >
          가장 빠른 경로
        </Text>
        <View style={[tw('flex flex-col items-start'), { gap: 8 }]}>
          <Text
            style={[
              tw('font-primary-700 text-on-surface-primary'),
              { fontSize: 26 },
            ]}
          >
            1시간 12분
          </Text>
          <Text
            style={[
              tw('font-primary-500 text-on-surface-primary'),
              { fontSize: 14 },
            ]}
          >
            오전 9:48- 오전 10:57
          </Text>
        </View>
        <View
          style={[tw('flex flex-row items-center justify-start'), { gap: 10 }]}
        >
          <Text
            style={[
              tw('font-primary-600 text-on-surface-primary'),
              { fontSize: 17 },
            ]}
          >
            15.2km
          </Text>
          <CalorieBadge value={143} />
          <TreeBadge value={1} />
        </View>
      </View>
      <View style={[tw('w-full'), { height: 1, backgroundColor: '#D8D8D8' }]} />
      <View
        style={[tw('w-full flex-1 flex flex-col justify-start'), { gap: 28 }]}
      >
        {/* 출발지 */}
        <View
          style={[tw('flex flex-row items-center justify-start'), { gap: 14 }]}
        >
          <IconSpotMarker
            color={'#006AFF'}
            width={23}
            height={28}
            label={'출발'}
            fontSize={10}
          />
          <Text style={[tw('font-primary-700 text-black'), { fontSize: 17 }]}>
            서울시 노원구 공릉로 232
          </Text>
        </View>
        {/* route */}
        <View
          style={[
            tw('flex flex-row flex-1 justify-start'),
            { gap: 14, paddingLeft: 5.5 },
          ]}
        >
          <RouteProgressStepVerticalBar />
          <View style={tw('flex flex-col justify-between flex-1 ')}>
            <View style={[tw('flex flex-col'), { gap: 22 }]}>
              <Text
                style={[
                  tw('font-primary-500 text-on-surface-quaternary'),
                  { fontSize: 15 },
                ]}
              >
                {'대여소까지 도보로 1.2km\u0020'}
                <Text
                  style={[tw('font-primary-500 text-black'), { fontSize: 15 }]}
                >
                  20분
                </Text>
              </Text>
              <View style={[tw('flex flex-col w-full'), { gap: 6 }]}>
                <View
                  style={[
                    tw('w-full'),
                    { height: 1, backgroundColor: '#D8D8D8' },
                  ]}
                />
                <Text
                  style={[tw('font-primary-600 text-black'), { fontSize: 15 }]}
                >
                  1600. 과기대 입구에서 자전거 탑승
                </Text>
              </View>
            </View>
            <View style={[tw('flex flex-col'), { gap: 22 }]}>
              <View style={[tw('flex flex-col w-full'), { gap: 6 }]}>
                <Text
                  style={[tw('font-primary-600 text-black'), { fontSize: 15 }]}
                >
                  1600. 과기대 입구에서 자전거 하차
                </Text>
                <View
                  style={[
                    tw('w-full'),
                    { height: 1, backgroundColor: '#D8D8D8' },
                  ]}
                />
              </View>
              <Text
                style={[
                  tw('font-primary-500 text-on-surface-quaternary'),
                  { fontSize: 15 },
                ]}
              >
                {'목적지까지 도보로 1.2km\u0020'}
                <Text
                  style={[tw('font-primary-500 text-black'), { fontSize: 15 }]}
                >
                  20분
                </Text>
              </Text>
            </View>
          </View>
        </View>
        {/* 도착지 */}
        <View
          style={[tw('flex flex-row items-center justify-start'), { gap: 14 }]}
        >
          <IconSpotMarker
            color={'#FF0000'}
            width={23}
            height={28}
            label={'도착'}
            fontSize={10}
          />
          <Text style={[tw('font-primary-700 text-black'), { fontSize: 17 }]}>
            서울시 노원구 동일로 242
          </Text>
        </View>
      </View>
      <RoundButton
        preset="lg"
        title="안내 시작하기"
        onPress={function (): void {
          throw new Error('Function not implemented.');
        }}
      />
    </ScrollView>
  );
};
export default RouteSelectDetailModal;
