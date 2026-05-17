import { DIRECTION_ICONS } from '@/features/navigation/model/navigation.constants';
import { Image, ImageStyle, Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { formatDistanceAdaptiveText } from '@/shared/utils/formatting';

interface InstructionItemProps {
  sign: number;
  text: string;
  intervalIdx: number;
  currentIdx: number | undefined;
  distanceMeter: number;
}

const InstructionItem = ({
  sign,
  text,
  intervalIdx,
  currentIdx,
  distanceMeter,
}: InstructionItemProps) => {
  const directionIcon =
    DIRECTION_ICONS[String(sign) as keyof typeof DIRECTION_ICONS] ??
    DIRECTION_ICONS['0'];

  return (
    <View
      style={[
        tw(
          'flex flex-row items-center w-full rounded-xl py-2 px-3 bg-surface-secondary',
        ),
        {
          gap: 12,
        },
      ]}
    >
      <View style={[tw('flex flex-col justify-center'), { gap: 6 }]}>
        <Image
          source={directionIcon}
          style={
            {
              width: 44,
              height: 44,
              backgroundColor: '#01DA86',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#E5E7EB',
            } as ImageStyle
          }
          resizeMode="cover"
        />
        {currentIdx === intervalIdx ? (
          <View
            style={[
              tw(
                'flex justify-center items-center rounded-lg p-1 bg-brand-primary',
              ),
              { minWidth: 44, alignSelf: 'center' },
            ]}
          >
            <Text
              style={[
                tw('font-primary-600 text-on-surface-secondary text-center'),
                { fontSize: 11 },
              ]}
              numberOfLines={1}
            >
              진행중
            </Text>
          </View>
        ) : currentIdx !== undefined && intervalIdx < currentIdx ? (
          <View
            style={[
              tw('flex justify-center items-center rounded-lg p-1 bg-black'),
              { minWidth: 44, alignSelf: 'center' },
            ]}
          >
            <Text
              style={[
                tw('font-primary-600 text-on-surface-secondary text-center'),
                { fontSize: 11 },
              ]}
              numberOfLines={1}
            >
              지나옴
            </Text>
          </View>
        ) : (
          <View
            style={[
              tw(
                'flex justify-center items-center rounded-lg p-1 bg-surface-disabled',
              ),
              { minWidth: 44, alignSelf: 'center' },
            ]}
          >
            <Text
              style={[
                tw('font-primary-600 text-on-surface-disabled text-center'),
                { fontSize: 11 },
              ]}
              numberOfLines={1}
            >
              예정
            </Text>
          </View>
        )}
      </View>

      <View
        style={[
          tw('flex flex-row items-start flex-1 justify-start'),
          { gap: 4 },
        ]}
      >
        <View
          style={tw(
            'flex justify-center h-5 w-5 items-center bg-surface-primary rounded-full border border-brand-primary',
          )}
        >
          <Text
            style={[
              tw('font-primary-600 text-on-surface-primary'),
              { fontSize: 13 },
            ]}
          >
            {intervalIdx + 1}
          </Text>
        </View>
        <View style={[tw('flex-1'), { minWidth: 0 }]}>
          <Text
            style={[
              tw('font-primary-600 text-on-surface-primary text-left'),
              { fontSize: 15, flexWrap: 'wrap', flexShrink: 1 },
            ]}
          >
            {text}
          </Text>
        </View>
        <Text
          style={[
            tw('font-primary-600 text-on-surface-primary text-right'),
            { fontSize: 12, marginTop: 2, flexShrink: 0 },
          ]}
        >
          {formatDistanceAdaptiveText(distanceMeter)}
        </Text>
      </View>
    </View>
  );
};

export default InstructionItem;
