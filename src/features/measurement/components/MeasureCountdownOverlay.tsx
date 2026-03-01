import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 999,
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
    >
      <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 72, color: '#fff' }}>
        {count > 0 ? count : '시작'}
      </Text>
    </View>
  );
}
