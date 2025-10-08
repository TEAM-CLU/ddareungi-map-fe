import React, { useEffect, useRef } from 'react';
import { Alert, Platform, Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import WebView from 'react-native-webview';
import { PERMISSIONS, check, RESULTS, request } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import Footer from '@/shared/components/Footer';
import Map from '@/features/map/components/Map';
import { SafeAreaView } from 'react-native-safe-area-context';
import MyLocationButton from '@/features/map/components/MyLocationButton';

const MapScreen = () => {
  const webRef = useRef<WebView | null>(null);

  return (
    <View style={tw('flex-1 relative w-full')}>
      <Map webRef={webRef} />
      <View style={tw('absolute bottom-40 right-3')}>
        <MyLocationButton webRef={webRef} />
      </View>
      <Footer />
    </View>
  );
};

export default MapScreen;
