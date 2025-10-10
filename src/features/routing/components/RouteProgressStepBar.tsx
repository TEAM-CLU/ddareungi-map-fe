import IconBicycle from '@/shared/components/icons/IconBicycle';
import IconRun from '@/shared/components/icons/IconRun';
import { tw } from '@/shared/libs/tw-helper';
import { Text, View } from 'react-native';

const RouteProgressStepBar = () => {
  return (
    <View style={tw('w-full flex flex-row ')}>
      <View
        style={[
          tw(
            'bg-decorative-default relative flex justify-center items-center flex-row rounded-full',
          ),
          { height: 11, flexGrow: 1, paddingVertical: 1 },
        ]}
      >
        <Text
          style={[
            tw('font-primary-600 text-on-surface-quaternary'),
            { fontSize: 8 },
          ]}
        >
          7
        </Text>
        <Text
          style={[
            tw('font-primary-600 text-on-surface-quaternary'),
            { fontSize: 6 },
          ]}
        >
          분
        </Text>
        <View
          style={[
            tw(
              'bg-decorative-default absolute left-0 items-center justify-center',
            ),
            {
              zIndex: 10,
              width: 20,
              height: 20,
              borderRadius: 10,
            },
          ]}
        >
          <View
            style={[
              tw('bg-icon-container-primary items-center justify-center'),
              {
                width: 16,
                height: 16,
                borderRadius: 8,
              },
            ]}
          >
            <IconRun />
          </View>
        </View>
      </View>
      <View
        style={[
          tw(
            'bg-brand-primary flex justify-center items-center flex-row relative',
          ),
          { height: 11, flexGrow: 3, paddingVertical: 1, zIndex: 5 },
        ]}
      >
        <View
          style={[
            tw('absolute items-center justify-center'),
            {
              zIndex: 10,
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: '#B2F9DE',
              left: -18.5,
            },
          ]}
        >
          <View
            style={[
              tw('bg-brand-primary items-center justify-center'),
              {
                width: 16,
                height: 16,
                borderRadius: 8,
              },
            ]}
          >
            <IconBicycle width={10} height={6} />
          </View>
        </View>
        <Text
          style={[
            tw('font-primary-600 text-on-surface-secondary'),
            { fontSize: 8 },
          ]}
        >
          57
        </Text>
        <Text
          style={[
            tw('font-primary-600 text-on-surface-secondary'),
            { fontSize: 6 },
          ]}
        >
          분
        </Text>
        <View
          style={[
            tw('absolute items-center justify-center'),
            {
              zIndex: 10,
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: '#B2F9DE',
              right: -18.5,
            },
          ]}
        >
          <View
            style={[
              tw('bg-brand-primary items-center justify-center'),
              {
                width: 16,
                height: 16,
                borderRadius: 8,
              },
            ]}
          >
            <IconBicycle width={10} height={6} />
          </View>
        </View>
      </View>
      <View
        style={[
          tw(
            'bg-decorative-default flex justify-center items-center flex-row rounded-full',
          ),
          { height: 11, flexGrow: 1, paddingVertical: 1 },
        ]}
      >
        <Text
          style={[
            tw('font-primary-600 text-on-surface-quaternary'),
            { fontSize: 8 },
          ]}
        >
          5
        </Text>
        <Text
          style={[
            tw('font-primary-600 text-on-surface-quaternary'),
            { fontSize: 6 },
          ]}
        >
          분
        </Text>
        <View
          style={[
            tw(
              'bg-decorative-default absolute right-0 items-center justify-center',
            ),
            {
              zIndex: 10,
              width: 20,
              height: 20,
              borderRadius: 10,
            },
          ]}
        >
          <View
            style={[
              tw('bg-icon-container-primary items-center justify-center'),
              {
                width: 16,
                height: 16,
                borderRadius: 8,
              },
            ]}
          >
            <IconRun />
          </View>
        </View>
      </View>
    </View>
  );
};
export default RouteProgressStepBar;
