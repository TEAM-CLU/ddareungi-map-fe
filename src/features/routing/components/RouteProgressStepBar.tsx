import IconBicycle from '@/shared/components/icons/IconBicycle';
import IconRun from '@/shared/components/icons/IconRun';
import { tw } from '@/shared/libs/tw-helper';
import { Text, View } from 'react-native';
import { Route } from '../model/routing.types';

interface RouteProgressStepBarProps {
  route: Route;
  firstWalkingMinutes: number;
  bikingMinutes: number;
  lastWalkingMinutes: number;
}

const RouteProgressStepBar = ({
  route,
  firstWalkingMinutes,
  bikingMinutes,
  lastWalkingMinutes,
}: RouteProgressStepBarProps) => {
  const hasNoFirstWalking = route.segments[0].summary.distance === 0;
  const hasNoLastWalking =
    route.segments[route.segments.length - 1].summary.distance === 0;

  return (
    <View style={tw('w-full flex flex-row')}>
      {!hasNoFirstWalking && (
        <View
          style={[
            tw(
              'bg-decorative-default relative flex justify-center items-center flex-row rounded-full',
            ),
            { height: 15, flexGrow: 1, paddingVertical: 1 },
          ]}
        >
          <Text
            style={[
              tw('font-primary-600 text-on-surface-quaternary'),
              { fontSize: 12 },
            ]}
          >
            {firstWalkingMinutes}
          </Text>
          <Text
            style={[
              tw('font-primary-600 text-on-surface-quaternary'),
              { fontSize: 10 },
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
                width: 24,
                height: 24,
                borderRadius: 14,
              },
            ]}
          >
            <View
              style={[
                tw('bg-icon-container-primary items-center justify-center'),
                {
                  width: 20,
                  height: 20,
                  borderRadius: 12,
                },
              ]}
            >
              <IconRun />
            </View>
          </View>
        </View>
      )}
      <View
        style={[
          tw(
            'bg-brand-primary flex justify-center items-center flex-row relative',
          ),
          {
            height: 15,
            flexGrow: 3,
            paddingVertical: 1,
            zIndex: 5,
            borderRadius: hasNoFirstWalking || hasNoLastWalking ? 9999 : 0,
          },
        ]}
      >
        <View
          style={[
            tw('absolute items-center justify-center'),
            {
              zIndex: 10,
              width: 24,
              height: 24,
              borderRadius: 14,
              backgroundColor: '#B2F9DE',
              left: hasNoFirstWalking ? 0 : hasNoLastWalking ? -14 : -18.5,
            },
          ]}
        >
          <View
            style={[
              tw('bg-brand-primary items-center justify-center'),
              {
                width: 20,
                height: 20,
                borderRadius: 12,
              },
            ]}
          >
            <IconBicycle width={14} height={10} />
          </View>
        </View>
        <Text
          style={[
            tw('font-primary-600 text-on-surface-secondary'),
            { fontSize: 12 },
          ]}
        >
          {bikingMinutes}
        </Text>
        <Text
          style={[
            tw('font-primary-600 text-on-surface-secondary'),
            { fontSize: 10 },
          ]}
        >
          분
        </Text>
        <View
          style={[
            tw('absolute items-center justify-center'),
            {
              zIndex: 10,
              width: 24,
              height: 24,
              borderRadius: 14,
              backgroundColor: '#B2F9DE',
              right: hasNoLastWalking ? 0 : hasNoFirstWalking ? -14 : -18.5,
            },
          ]}
        >
          <View
            style={[
              tw('bg-brand-primary items-center justify-center'),
              {
                width: 20,
                height: 20,
                borderRadius: 12,
              },
            ]}
          >
            <IconBicycle width={14} height={10} />
          </View>
        </View>
      </View>
      {!hasNoLastWalking && (
        <View
          style={[
            tw(
              'bg-decorative-default flex justify-center items-center flex-row rounded-full',
            ),
            { height: 15, flexGrow: 1, paddingVertical: 1 },
          ]}
        >
          <Text
            style={[
              tw('font-primary-600 text-on-surface-quaternary'),
              { fontSize: 12 },
            ]}
          >
            {lastWalkingMinutes}
          </Text>
          <Text
            style={[
              tw('font-primary-600 text-on-surface-quaternary'),
              { fontSize: 10 },
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
                width: 24,
                height: 24,
                borderRadius: 14,
              },
            ]}
          >
            <View
              style={[
                tw('bg-icon-container-primary items-center justify-center'),
                {
                  width: 20,
                  height: 20,
                  borderRadius: 12,
                },
              ]}
            >
              <IconRun />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
export default RouteProgressStepBar;
