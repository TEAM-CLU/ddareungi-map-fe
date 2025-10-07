import React, { useEffect, useRef } from 'react';
import { Alert, Platform, Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import WebView from 'react-native-webview';
import { PERMISSIONS, check, RESULTS, request } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import Footer from '@/shared/components/Footer';
import Map from '@/features/map/components/Map';

const MapScreen = () => {
  return (
    <View style={tw('flex-1')}>
      {/* 검색바 */}
      <Map />
      <Footer />
    </View>
  );
};

export default MapScreen;
