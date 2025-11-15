(function () {
  let kakaoRef, mapRef;
  let startMarker,
    endMarker,
    originMarker,
    waypointsMarkers = [];
  let routeRemaining;
  let routePassed;
  let currentRouteType = 'CONSTANT'; // 'CONSTANT' | 'LOOP'
  let currentRoutePoints = [];
  let currentRoutePath = [];

  const ROUTE_STYLE = {
    remaining: {
      strokeColor: '#01DA86',
      strokeWeight: 8,
      strokeOpacity: 1,
      strokeStyle: 'solid',
      zIndex: 5,
    },
    passed: {
      strokeColor: '#CFCCD4',
      strokeWeight: 8,
      strokeOpacity: 1,
      strokeStyle: 'solid',
      zIndex: 4,
    },
  };

  const initRouteSetting = (kakao, map, DEFAULT_LAT, DEFAULT_LON) => {
    kakaoRef = kakao;
    mapRef = map;

    const defaultPos = new kakaoRef.maps.LatLng(DEFAULT_LAT, DEFAULT_LON);

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

    // 폴리라인 생성 및 초기세팅
    routeRemaining = new kakaoRef.maps.Polyline({
      path: [],
      ...ROUTE_STYLE.remaining,
    });

    routePassed = new kakaoRef.maps.Polyline({
      path: [],
      ...ROUTE_STYLE.passed,
    });
  };

  // 라우팅 정보 정규화(추후 필요)

  /**
   * 경유지 마커 생성 함수
   * @param {Array<{ lat: number, lon: number }>} waypoints - 경유지 좌표 배열
   */

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
      const waypointPos = new kakaoRef.maps.LatLng(waypoint.lat, waypoint.lon);
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

  // ---------------------------------------------
  // 경로 그리기
  // drawRoute(opts)
  //   - mode: 'full' | 'round' (전체 여정 / 왕복)
  //   - start: {lat,lon}   (full 전용)
  //   - end:   {lat,lon}   (full 전용)
  //   - origin: {lat,lon}  (round 전용; 시작=도착 원점)
  //   - waypoints: [{lat,lon}, ...] (선택)
  //   - path: [{lat,lon}] 또는 [[lng,lat], ...] 또는 세그먼트 배열
  //   - fit: boolean (지도를 경로에 맞춰줌; 기본 true)
  // ---------------------------------------------
  /**
   * 단순 경로 표시용 함수 (네비게이션 모드 X)
   * 출발/도착/경유지 마커와 전체 경로(remaining)만 표시
   */

  // 단순 좌표 배열 -> kakao.maps.LatLng 배열 변환 함수
  const convertToLatLonArray = coords => {
    if (!kakaoRef) {
      console.error('카카오맵 초기화 실패');
      return [];
    }
    return coords.map(coord => new kakaoRef.maps.LatLng(coord.lat, coord.lon));
  };

  // 경로 조밀하게 그리기
  const densifyPath = (path, interval = 5) => {
    const EARTH_RADIUS = 6371000; // m
    const toRad = deg => (deg * Math.PI) / 180;
    const toDeg = rad => (rad * 180) / Math.PI;

    const result = [];
    if (path.length < 2) return path;

    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];

      const lat1 = toRad(p1.lat);
      const lon1 = toRad(p1.lon);
      const lat2 = toRad(p2.lat);
      const lon2 = toRad(p2.lon);

      // 두 점 간 거리
      const d =
        2 *
        EARTH_RADIUS *
        Math.asin(
          Math.sqrt(
            Math.sin((lat2 - lat1) / 2) ** 2 +
              Math.cos(lat1) *
                Math.cos(lat2) *
                Math.sin((lon2 - lon1) / 2) ** 2,
          ),
        );

      result.push(p1);

      // 일정 간격으로 나눠서 중간 점 생성
      const steps = Math.floor(d / interval);
      for (let s = 1; s < steps; s++) {
        const f = s / steps;
        const A =
          Math.sin(((1 - f) * d) / EARTH_RADIUS) / Math.sin(d / EARTH_RADIUS);
        const B = Math.sin((f * d) / EARTH_RADIUS) / Math.sin(d / EARTH_RADIUS);
        const x =
          A * Math.cos(lat1) * Math.cos(lon1) +
          B * Math.cos(lat2) * Math.cos(lon2);
        const y =
          A * Math.cos(lat1) * Math.sin(lon1) +
          B * Math.cos(lat2) * Math.sin(lon2);
        const z = A * Math.sin(lat1) + B * Math.sin(lat2);

        const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
        const lon = toDeg(Math.atan2(y, x));
        result.push({ lat, lon });
      }
    }
    result.push(path[path.length - 1]);
    return result;
  };

  const drawStaticRoute = drawRouteOpts => {
    // 옵션 세팅
    const {
      mode = 'full',
      start,
      end,
      origin,
      waypoints = [],
      path = [],
      fit = true,
    } = drawRouteOpts;

    // 경로 그리기: 마커 찍고 그위에 remaining 경로를 띄워주기
    // 1. 기존 마커/폴리라인 제거
    if (startMarker) startMarker.setMap(null);
    if (endMarker) endMarker.setMap(null);
    if (originMarker) originMarker.setMap(null);
    clearWaypointsMarkers();
    routeRemaining.setMap(null);
    routeRemaining.setPath([]);
    routePassed.setMap(null);
    routePassed.setPath([]);

    // 2. 마커 찍기
    if (mode === 'full') {
      if (start && start.lat && start.lon) {
        const startPos = new kakaoRef.maps.LatLng(start.lat, start.lon);
        startMarker.setPosition(startPos);
        startMarker.setMap(mapRef);
      }
      if (end && end.lat && end.lon) {
        const endPos = new kakaoRef.maps.LatLng(end.lat, end.lon);
        endMarker.setPosition(endPos);
        endMarker.setMap(mapRef);
      }
      if (waypoints.length > 0) {
        createWaypointsMarkers(waypoints);
      }
    }

    if (mode === 'round') {
      if (origin && origin.lat && origin.lon) {
        const originPos = new kakaoRef.maps.LatLng(origin.lat, origin.lon);
        originMarker.setPosition(originPos);
        originMarker.setMap(mapRef);
      }
      if (waypoints.length > 0) {
        createWaypointsMarkers(waypoints);
      }
    }

    // 3. 경로 그리기
    // 3-1. 시작점~경유지~도착점 좌표 배열을 convertToLatLonArray로 변환
    const densifiedPath = densifyPath(path, 5); // 5m 간격으로 조밀하게
    const kakaoPath = convertToLatLonArray(densifiedPath);
    // 3-2. remaining 경로 그리기
    if (kakaoPath.length > 0) {
      routeRemaining.setPath(kakaoPath);
      routeRemaining.setMap(mapRef);
    }

    //

    // 4. fit 여부에 따라 지도 위치/줌레벨 조정
    if (fit && kakaoPath.length > 0) {
      const bounds = new kakaoRef.maps.LatLngBounds();
      kakaoPath.forEach(latlng => bounds.extend(latlng));
      mapRef.setBounds(bounds, 100); // 패딩 100px
    }
  };

  // 네비게이션용 경로(기존 지나온 경로 지우기, 이탈시 재탐색 등) 추후 구현 예정

  // 경로 타입 변경 (constant / loop)
  const setRouteType = routeType => {
    currentRouteType = routeType;
  };

  /*
   초기화
   */
  const clearRoute = () => {
    currentRoutePoints = [];
    currentRoutePath = [];

    // 마커들 지도에서 제거
    if (startMarker) startMarker.setMap(null);
    if (endMarker) endMarker.setMap(null);
    if (originMarker) originMarker.setMap(null);
    clearWaypointsMarkers();

    // 폴리라인 제거
    if (routeRemaining) {
      routeRemaining.setPath([]);
      routeRemaining.setMap(null);
    }
    if (routePassed) {
      routePassed.setPath([]);
      routePassed.setMap(null);
    }
  };

  /*
    좌표 정규화 함수
    외부에서 들어오는 좌표 데이터 이름이 제각각일 경우 통일
  */
  const normalizeLatLon = coord => {
    // lat, latitude 둘 중 있는 거 사용
    const lat = coord.lat ?? coord.latitude;
    // lon, lng, longitude 셋 중 있는 거 사용
    const lon = coord.lon ?? coord.lng ?? coord.longitude;
    return { lat, lon };
  };

  /*
    경로 업데이트 함수
    useRoutePreviewOnMap 훅에서 updateRoute(...)를 호출하면 실행
  */
  const updateRoute = (routeType = 'CONSTANT', points = [], path = []) => {
    // 1. 데이터가 없으면 모두 초기화 후 종료
    if (!points || points.length === 0) {
      clearRoute();
      return;
    }

    currentRouteType = routeType;
    currentRoutePoints = points;

    // 2. 좌표 데이터 이름 통일
    const normalizedPoints = points
      .map(point => ({
        ...point,
        ...normalizeLatLon(point),
      }))
      .filter(
        point => typeof point.lat === 'number' && typeof point.lon === 'number',
      );

    if (normalizedPoints.length === 0) {
      clearRoute();
      return;
    }

    // 3. 출발/도착/경유지 분류
    const startPoint =
      normalizedPoints.find(point => point.id === 'start') ||
      normalizedPoints[0];
    const endPoint =
      normalizedPoints.find(point => point.id === 'end') ||
      normalizedPoints[normalizedPoints.length - 1];
    const waypointPoints = normalizedPoints.filter(point =>
      point.id.startsWith('waypoint-'),
    );

    // 4. 경로 데이터 처리
    // 서버에서 받은 경로 (path)가 있으면 사용, 없으면 포인트들 이은 직선 경로 생성
    const normalizedPath = (
      path && path.length > 0
        ? path
        : normalizedPoints.map(point => ({ lat: point.lat, lon: point.lon }))
    )
      .map(coord => normalizeLatLon(coord));

    currentRoutePath = normalizedPath;

    // 5. 경로 그리기
    drawStaticRoute({
      mode: routeType === 'LOOP' ? 'round' : 'full',
      start: routeType === 'LOOP' ? null : startPoint,
      end: routeType === 'LOOP' ? null : endPoint,
      origin: routeType === 'LOOP' ? startPoint : undefined,
      waypoints: waypointPoints,
      path: normalizedPath,
    });
  };

  /*
    특정 경로 포인트로 지도 이동
   */
  const moveToRoutePoint = pointId => {
    if (!mapRef || !kakaoRef || !pointId) return;
    const target = currentRoutePoints.find(point => point.id === pointId);
    if (!target) return;
    const lat = target.lat ?? target.latitude;
    const lon = target.lng ?? target.lon ?? target.longitude;
    const targetPosition = new kakaoRef.maps.LatLng(lat, lon);
    mapRef.panTo(targetPosition);
  };

  window.Route = {
    initRouteSetting,
    drawStaticRoute,
    setRouteType,
    updateRoute,
    clearRoute,
    moveToRoutePoint,
  };
})();
