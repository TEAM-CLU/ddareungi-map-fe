import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';

interface MapLoadingOverlayProps {
  title: string;
}

const MapLoadingOverlay = ({ title }: MapLoadingOverlayProps) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const progressLoop = Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    );

    progressLoop.start();
    return () => progressLoop.stop();
  }, [progressAnim]);

  const progressTranslateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-72, 188],
  });
  const progressOpacity = progressAnim.interpolate({
    inputRange: [0, 0.18, 0.82, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={[tw('font-secondary text-brand-primary'), styles.brand]}>
          따릉이맵
        </Text>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressIndicator,
              {
                opacity: progressOpacity,
                transform: [{ translateX: progressTranslateX }],
              },
            ]}
          />
        </View>
        <Text
          style={[tw('font-primary-700 text-on-surface-primary'), styles.title]}
        >
          {title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  brand: {
    fontSize: 27,
    height: 46,
    includeFontPadding: true,
    lineHeight: 42,
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  progressIndicator: {
    backgroundColor: '#01DA86',
    borderRadius: 999,
    height: 3,
    position: 'absolute',
    left: 0,
    top: 0,
    width: 72,
  },
  progressTrack: {
    backgroundColor: 'rgba(1, 218, 134, 0.18)',
    borderRadius: 999,
    height: 3,
    marginBottom: 22,
    marginTop: 14,
    overflow: 'hidden',
    width: 190,
  },
  title: {
    fontSize: 18,
    lineHeight: 25,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MapLoadingOverlay;
