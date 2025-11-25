(function () {
  let kakaoRef, mapRef;
  let startMarker,
    endMarker,
    originMarker,
    waypointsMarkers = [],
    startStationMarker,
    endStationMarker;
  let staticPolylineOutline; // 어두운 외곽선
  let staticPolylineMain; // 메인 컬러 라인
  let staticPolylineDash; // 위에 얇은 점선
  let kakaoPath = [];

  const initRouteSetting = (kakao, map, DEFAULT_LAT, DEFAULT_LNG) => {
    kakaoRef = kakao;
    mapRef = map;

    const defaultPos = new kakaoRef.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG);

    // 출발지 마커 생성 및 초기 세팅

    // 출발/도착/원점 마커 SVG 생성 함수
    const buildMarkerHTML = (
      label,
      fill = '#006AFF',
      textColor = '#fff',
      stroke = null,
    ) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40" style="display:block">
    <path d="M32.001 16.8882C32.001 29.333 16.0005 40 16.0005 40C16.0005 40 0 29.333 0 16.8882C0 8.05136 7.16366 0.8877 16.0005 0.8877C24.8373 0.8877 32.001 8.05136 32.001 16.8882Z"
      fill="${fill}" ${stroke ? `stroke="${stroke}" stroke-width="2"` : ''}/>
    <text x="16" y="16" text-anchor="middle"
      alignment-baseline="central" dy=".35em"
      font-family="Pretendard, 'Noto Sans KR', Arial, sans-serif"
      font-size="12" font-weight="bold"
      fill="${textColor}">
      ${label}
    </text>
  </svg>
`;

    const startMarkerSvg = buildMarkerHTML('출발', '#006AFF', '#fff');
    const endMarkerSvg = buildMarkerHTML('도착', '#FF0000', '#fff');
    const originMarkerSvg = buildMarkerHTML(
      '원점',
      '#00C7AE',
      '#fff',
      '#FFFFFF',
    );

    startMarker = new kakaoRef.maps.CustomOverlay({
      position: defaultPos,
      content: startMarkerSvg,
      yAnchor: 1,
      zIndex: 10,
    });

    endMarker = new kakaoRef.maps.CustomOverlay({
      position: defaultPos,
      content: endMarkerSvg,
      yAnchor: 1,
      zIndex: 10,
    });

    originMarker = new kakaoRef.maps.CustomOverlay({
      position: defaultPos,
      content: originMarkerSvg,
      yAnchor: 1,
      zIndex: 12,
    });

    startStationMarker = new kakaoRef.maps.CustomOverlay({
      position: defaultPos,
      content: getStationMarkerSvg('대여소'),
      yAnchor: 1,
      zIndex: 9,
    });

    endStationMarker = new kakaoRef.maps.CustomOverlay({
      position: defaultPos,
      content: getStationMarkerSvg('대여소'),
      yAnchor: 1,
      zIndex: 9,
    });
    // 정적경로 폴리라인 초기화 (3중 레이어)
    staticPolylineOutline = new kakaoRef.maps.Polyline({
      path: [],
      strokeColor: '#006633', // 짙은 녹색 아웃라인
      strokeWeight: 10,
      strokeOpacity: 0.45,
      strokeStyle: 'solid',
      zIndex: 3,
    });

    staticPolylineMain = new kakaoRef.maps.Polyline({
      path: [],
      strokeColor: '#00C267', // 메인 밝은 네비 그린
      strokeWeight: 8,
      strokeOpacity: 1,
      strokeStyle: 'solid',
      zIndex: 4,
    });

    staticPolylineDash = new kakaoRef.maps.Polyline({
      path: [],
      strokeColor: '#C8FFF1', // 밝은 민트 점선
      strokeWeight: 3,
      strokeOpacity: 0.9,
      strokeStyle: 'shortdash',
      zIndex: 5,
    });
  };

  // 대여소 마커 svg 생성 함수
  const getStationMarkerSvg = (label = '', color = '#01DA86') => `
<svg xmlns="http://www.w3.org/2000/svg" width="41" height="48" viewBox="0 0 41 48" fill="none">
  <g filter="url(#filter0_d)">
    <path fill-rule="evenodd" clip-rule="evenodd"
      d="M36 16.5C36 28.5556 20.5 38.8889 20.5 38.8889C20.5 38.8889 5 28.5556 5 16.5C5 7.93959 11.9396 1 20.5 1C29.0604 1 36 7.93959 36 16.5Z"
      fill="white" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <text
      x="20.5"
      y="14"
      text-anchor="middle"
      alignment-baseline="central"
      dy=".35em"
      fill="#414548"
      font-family="Pretendard, 'Noto Sans KR', Arial, sans-serif"
      font-size="10"
      font-weight="600"
      line-height="24"
    >
      ${label}
    </text>
  </g>
  <defs>
    <filter id="filter0_d" x="0" y="0" width="41" height="47.8889"
      filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix"
        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="4"/>
      <feGaussianBlur stdDeviation="2"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix"
        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
    </filter>
  </defs>
</svg>
`;

  // 경유지 마커 svg 생성 함수
  const getWaypointMarkerSvg = (label = '') => `
  <svg xmlns="http://www.w3.org/2000/svg"
       width="32" height="40" viewBox="0 0 32 44"
       style="display:block">
    <path d="M32.001 17.8882C32.001 30.333 16.0005 41 16.0005 41C16.0005 41 0 30.333 0 17.8882C0 9.05136 7.16366 1.8877 16.0005 1.8877C24.8373 1.8877 32.001 9.05136 32.001 17.8882Z"
          fill="#FAE100" stroke="#FFFFFF" stroke-width="2"/>
    <text x="16" y="16" text-anchor="middle"
      alignment-baseline="central" dy=".35em"
      font-family="Pretendard, 'Noto Sans KR', Arial, sans-serif"
      font-size="12" font-weight="bold"
      fill="#111">
      ${label}
    </text>
  </svg>
`;

  const clearWaypointsMarkers = () => {
    if (waypointsMarkers.length > 0) {
      waypointsMarkers.forEach(wayPointMarker => wayPointMarker.setMap(null));
      waypointsMarkers = [];
    }
  };

  const createWaypointsMarkers = waypoints => {
    // 기존 경유지 마커 제거
    clearWaypointsMarkers();

    // 새 waypoints 배열을 순회하며 새 마커 생성
    waypoints.forEach((waypoint, idx) => {
      const waypointPos = new kakaoRef.maps.LatLng(waypoint.lat, waypoint.lng);
      const waypointMarker = new kakaoRef.maps.CustomOverlay({
        position: waypointPos,
        content: getWaypointMarkerSvg(`경유${idx + 1}`), // label 자동 생성
        yAnchor: 1,
        zIndex: 11,
      });
      waypointMarker.setMap(mapRef);
      waypointsMarkers.push(waypointMarker);
    });
  };

  // 단순 좌표 배열 -> kakao.maps.LatLng 배열 변환 함수
  const convertToKakaoLatLngArray = coords => {
    return coords.map(coord => {
      const [lng, lat] = coord;
      return new kakaoRef.maps.LatLng(lat, lng);
    });
  };

  const clearStaticPath = () => {
    if (startMarker) startMarker.setMap(null);
    if (endMarker) endMarker.setMap(null);
    if (originMarker) originMarker.setMap(null);
    if (startStationMarker) startStationMarker.setMap(null);
    if (endStationMarker) endStationMarker.setMap(null);
    if (kakaoPath.length > 0) kakaoPath = [];

    clearWaypointsMarkers();

    // 3중 폴리라인 전부 제거
    if (staticPolylineOutline) {
      staticPolylineOutline.setMap(null);
      staticPolylineOutline.setPath([]);
    }
    if (staticPolylineMain) {
      staticPolylineMain.setMap(null);
      staticPolylineMain.setPath([]);
    }
    if (staticPolylineDash) {
      staticPolylineDash.setMap(null);
      staticPolylineDash.setPath([]);
    }
  };

  const drawStaticPath = staticPathData => {
    // 옵션 세팅
    const {
      routeType,
      startPoint,
      endPoint,
      waypoints,
      pathCoordinates,
      startStationPoint,
      endStationPoint,
    } = staticPathData;

    // 1. 기존 마커/폴리라인 제거
    clearStaticPath();

    // 2. 마커 찍기
    if (routeType === 'constant') {
      const [startLng, startLat] = startPoint;
      const [endLng, endLat] = endPoint;

      const startPos = new kakaoRef.maps.LatLng(startLat, startLng);
      startMarker.setPosition(startPos);
      startMarker.setMap(mapRef);

      const endPos = new kakaoRef.maps.LatLng(endLat, endLng);
      endMarker.setPosition(endPos);
      endMarker.setMap(mapRef);
      if (startStationPoint) {
        const startStationPos = new kakaoRef.maps.LatLng(
          startStationPoint.lat,
          startStationPoint.lng,
        );
        startStationMarker.setPosition(startStationPos);
        startStationMarker.setMap(mapRef);
      }
      if (endStationPoint) {
        const endStationPos = new kakaoRef.maps.LatLng(
          endStationPoint.lat,
          endStationPoint.lng,
        );
        endStationMarker.setPosition(endStationPos);
        endStationMarker.setMap(mapRef);
      }
      if (waypoints) {
        createWaypointsMarkers(waypoints);
      }
    }

    if (routeType === 'loop') {
      const [originLng, originLat] = startPoint;
      const originPos = new kakaoRef.maps.LatLng(originLat, originLng);
      originMarker.setPosition(originPos);
      originMarker.setMap(mapRef);
      if (startStationPoint) {
        const startStationPos = new kakaoRef.maps.LatLng(
          startStationPoint.lat,
          startStationPoint.lng,
        );
        startStationMarker.setPosition(startStationPos);
        startStationMarker.setMap(mapRef);
      }
      if (endStationPoint) {
        const endStationPos = new kakaoRef.maps.LatLng(
          endStationPoint.lat,
          endStationPoint.lng,
        );
        endStationMarker.setPosition(endStationPos);
        endStationMarker.setMap(mapRef);
      }
      if (waypoints) {
        createWaypointsMarkers(waypoints);
      }
    }
    // 3. 경로 그리기
    kakaoPath = convertToKakaoLatLngArray(pathCoordinates);
    kakaoPathForFocus = kakaoPath.slice();

    // 3중 레이어 모두 동일한 path로 세팅
    if (staticPolylineOutline) {
      staticPolylineOutline.setPath(kakaoPath);
      staticPolylineOutline.setMap(mapRef);
    }
    if (staticPolylineMain) {
      staticPolylineMain.setPath(kakaoPath);
      staticPolylineMain.setMap(mapRef);
    }
    if (staticPolylineDash) {
      staticPolylineDash.setPath(kakaoPath);
      staticPolylineDash.setMap(mapRef);
    }

    focusOnStaticPath();
  };

  // 바운드 맞추기
  const focusOnStaticPath = () => {
    const bounds = new kakaoRef.maps.LatLngBounds();
    kakaoPath.forEach(latlng => bounds.extend(latlng));
    mapRef.setBounds(bounds, 100);
  };

  window.Route = {
    initRouteSetting,
    drawStaticPath,
    clearStaticPath,
    focusOnStaticPath,
  };
})();
