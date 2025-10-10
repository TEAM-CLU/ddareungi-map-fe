(function () {
  let kakaoRef, mapRef;
  let currentPlaceMarker, currentPlaceInfoWindow;
  let searchMarkers = [];

  const initSearchSetting = (kakao, map) => {
    kakaoRef = kakao;
    mapRef = map;
  };

  // 장소 마커 표시
  const showPlaceMarker = (lat, lng, placeName, placeInfo) => {
    // 기존 마커 제거
    clearCurrentPlaceMarker();

    const position = new kakaoRef.maps.LatLng(lat, lng);

    // 임시 커스텀 마커 SVG -> 추후 변경
    const markerSvg = `
      <div style="
        position: relative;
        width: 32px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns='http://www.w3.org/2000/svg' width='32' height='40' viewBox='0 0 32 40' fill='none'>
          <path d='M16 0C24.8 0 32 7.2 32 16C32 28 16 40 16 40S0 28 0 16C0 7.2 7.2 0 16 0Z' fill='#FF6B35'/>
          <circle cx='16' cy='16' r='8' fill='white'/>
          <circle cx='16' cy='16' r='4' fill='#FF6B35'/>
        </svg>
      </div>
    `;

    currentPlaceMarker = new kakaoRef.maps.CustomOverlay({
      position: position,
      content: markerSvg,
      xAnchor: 0.5,
      yAnchor: 1,
      zIndex: 100,
    });

    currentPlaceMarker.setMap(mapRef);

    // 맵 중심을 해당 위치로 이동
    mapRef.setCenter(position);
    mapRef.setLevel(3);

    // React Native로 결과 전송
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'placeMarkerShown',
          lat: lat,
          lng: lng,
          placeName: placeName,
        }),
      );
    }
  };

  // 현재 장소 마커 제거
  const clearCurrentPlaceMarker = () => {
    if (currentPlaceMarker) {
      currentPlaceMarker.setMap(null);
      currentPlaceMarker = null;
    }
    if (currentPlaceInfoWindow) {
      currentPlaceInfoWindow.close();
      currentPlaceInfoWindow = null;
    }
  };

  // 특정 위치로 맵 이동
  const moveToLocation = (lat, lng, placeName) => {
    const position = new kakaoRef.maps.LatLng(lat, lng);
    mapRef.setCenter(position);
    mapRef.setLevel(3);

    // React Native로 결과 전송
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'mapMovedToLocation',
          lat: lat,
          lng: lng,
          placeName: placeName,
        }),
      );
    }
  };

  // 여러 장소에 마커 표시 (검색 결과용 - 카페/음식점 등 카테고리로 검색한 결과)
  const showSearchResults = places => {
    // 기존 검색 마커들 제거
    clearSearchMarkers();

    const bounds = new kakaoRef.maps.LatLngBounds();

    places.forEach((place, index) => {
      const position = new kakaoRef.maps.LatLng(place.lat, place.lng);

      // 임시 검색 결과 마커 SVG (번호 표시) -> 추후 변경
      const searchMarkerSvg = `
        <div style="
          position: relative;
          width: 28px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg xmlns='http://www.w3.org/2000/svg' width='28' height='36' viewBox='0 0 28 36' fill='none'>
            <path d='M14 0C21.7 0 28 6.3 28 14C28 24.5 14 36 14 36S0 24.5 0 14C0 6.3 6.3 0 14 0Z' fill='#4285F4'/>
            <circle cx='14' cy='14' r='10' fill='white'/>
            <text x='14' y='18' text-anchor='middle' font-size='12' font-weight='bold' fill='#4285F4'>${
              index + 1
            }</text>
          </svg>
        </div>
      `;

      const marker = new kakaoRef.maps.CustomOverlay({
        position: position,
        content: searchMarkerSvg,
        xAnchor: 0.5,
        yAnchor: 1,
        zIndex: 90,
      });

      marker.setMap(mapRef);
      searchMarkers.push(marker);

      // 경계에 추가
      bounds.extend(position);

      // 마커 클릭 이벤트 (InfoWindow 표시)
      kakaoRef.maps.event.addListener(marker, 'click', () => {
        showPlaceInfoWindow(place, position);
      });
    });

    // 모든 마커가 보이도록 맵 범위 조정
    if (places.length > 0) {
      mapRef.setBounds(bounds);
    }
  };

  // 장소 정보창 표시 - React Native PlaceDetailModal 사용
  const showPlaceInfoWindow = (place, position) => {
    // 기존 정보창 닫기 (혹시 있다면)
    if (currentPlaceInfoWindow) {
      currentPlaceInfoWindow.close();
      currentPlaceInfoWindow = null;
    }

    // React Native로 장소 정보 전송하여 PlaceDetailModal 띄우기
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'showPlaceDetailModal',
          place: {
            name: place.name,
            address: place.address || '',
            category: place.category || '',
            lat: place.lat,
            lng: place.lng,
            id: place.id || `${place.lat}_${place.lng}`, // 고유 ID 생성
          },
        }),
      );
    }
  };

  // 검색 마커들 제거
  const clearSearchMarkers = () => {
    searchMarkers.forEach(marker => {
      marker.setMap(null);
    });
    searchMarkers = [];
  };

  // 모든 검색 관련 요소 제거
  const clearAllSearchElements = () => {
    clearCurrentPlaceMarker();
    clearSearchMarkers();
  };

  window.Search = {
    initSearchSetting,
    showPlaceMarker,
    moveToLocation,
    showSearchResults,
    clearCurrentPlaceMarker,
    clearSearchMarkers,
    clearAll: clearAllSearchElements,
  };
})();
