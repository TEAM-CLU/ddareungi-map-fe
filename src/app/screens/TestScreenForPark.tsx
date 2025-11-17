import React, { useEffect, useState, useRef } from 'react';
import { Text, View, Alert } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import RouteTimeRefreshBar from '@/features/routing/components/RouteTimeRefreshBar';



const TestScreenForPark = () => {
  const [baseTime, setBaseTime] = useState<Date>(new Date());

  return (
    <View style={tw('flex-1 bg-white')}>
      <View style={tw('px-4 pt-12')}>
        <RouteTimeRefreshBar
          baseTime={baseTime}
          onRefresh={() => setBaseTime(new Date())}
        />
      </View>
    </View>
  );
};

export default TestScreenForPark;
