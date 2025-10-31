import IconBicycle from '@/shared/components/icons/IconBicycle';
import IconRun from '@/shared/components/icons/IconRun';
import { tw } from '@/shared/libs/tw-helper';
import { Text, View } from 'react-native';

const RouteProgressStepVerticalBar = () => {
  return (
    <View style={[tw('flex flex-col justify-start'), { height: 230 }]}>
      <View
        style={[
          tw('flex flex-col rounded-full bg-decorative-default'),
          { width: 11, flexGrow: 1 },
        ]}
      />
      <View
        style={[
          tw(
            'bg-decorative-default absolute top-0 items-center justify-center',
          ),
          {
            zIndex: 10,
            width: 20,
            height: 20,
            borderRadius: 10,
            left: -5,
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
      <View
        style={[
          tw('absolute items-center justify-center'),
          {
            zIndex: 10,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#B2F9DE',
            top: 37.5,
            left: -5,
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
      <View
        style={[
          tw('flex flex-col rounded-full bg-brand-primary'),
          { width: 11, flexGrow: 3 },
        ]}
      />
      <View
        style={[
          tw('absolute items-center justify-center'),
          {
            zIndex: 10,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#B2F9DE',
            bottom: 37.5,
            left: -5,
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
      <View
        style={[
          tw('flex flex-col rounded-full bg-decorative-default'),
          { width: 11, flexGrow: 1 },
        ]}
      />
      <View
        style={[
          tw(
            'bg-decorative-default absolute bottom-0 items-center justify-center',
          ),
          {
            zIndex: 10,
            width: 20,
            height: 20,
            borderRadius: 10,
            left: -5,
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
  );
};
export default RouteProgressStepVerticalBar;
