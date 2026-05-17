import React, { useEffect, useState, useRef } from 'react';
import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';

interface MeasureCountdownOverlayProps {
  onComplete: () => void;
}

export default function MeasureCountdownOverlay({
  onComplete,
}: MeasureCountdownOverlayProps) {
  const [count, setCount] = useState(3);
  const completedRef = useRef(false);

  useEffect(() => {
    if (count <= 0) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onComplete]);

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={[
          tw('font-primary-700 text-brand-primary'),
          { fontSize: 72 },
        ]}
      >
        {count > 0 ? count : '시작'}
      </Text>
    </View>
  );
}
