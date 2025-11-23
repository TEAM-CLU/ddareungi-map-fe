import { tw } from '@/shared/libs/tw-helper';
import { formatDistance, formatTime } from '@/shared/utils/formatting';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

interface SelectedRouteDetailBadgeProps {
  existText?: string;
  value?: number;
  textColor: string;
  type?: 'distance' | 'time';
}
const SelectedRouteDetailBadge = ({
  existText,
  value,
  textColor,
  type,
}: SelectedRouteDetailBadgeProps) => {
  const [text, setText] = useState<string>('');

  useEffect(() => {
    if (!value) return;
    if (type === 'distance') {
      const formattedDistance = formatDistance(value);
      setText(formattedDistance);
    }

    if (type === 'time') {
      const formattedDistnace = formatTime(value);
      setText(formattedDistnace);
    }
  }, []);

  return (
    <View
      style={[
        tw('bg-surface-primary h-8 shadow-md justify-center items-center'),
        { borderRadius: 20, paddingHorizontal: 13, paddingVertical: 6 },
      ]}
    >
      <Text
        style={[tw('font-primary-600'), { color: textColor, fontSize: 15 }]}
      >
        {existText ? existText : text}
      </Text>
    </View>
  );
};

export default SelectedRouteDetailBadge;
