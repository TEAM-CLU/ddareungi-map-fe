import { Text, TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { IconRefresh } from '@/shared/components/icons';
import { useEffect, useState } from 'react';
import { formatTimeHMWithPeriodText } from '@/shared/utils/formatting';

interface RouteTimeRefreshBarProps {
  baseTime: Date;
  onRefresh: () => void;
}

const RouteTimeRefreshBar = ({
  baseTime,
  onRefresh,
}: RouteTimeRefreshBarProps) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setCurrentTime(formatTimeHMWithPeriodText(baseTime));
  }, [baseTime]);

  const handleRefreshTime = () => {
    onRefresh();
  };

  return (
    <View
      style={[
        tw('flex-row items-center'),
        {
          height: 43,
        },
      ]}
    >
      <Text
        style={[
          tw('font-primary-500 text-on-surface-primary'),
          { fontSize: 14 },
        ]}
      >
        {`${currentTime}에 출발`}
      </Text>
      <TouchableOpacity
        onPress={handleRefreshTime}
        style={tw('px-1 pb-1 rounded-full')}
      >
        <IconRefresh color="#414548" width={16} height={16} />
      </TouchableOpacity>
    </View>
  );
};

export default RouteTimeRefreshBar;
