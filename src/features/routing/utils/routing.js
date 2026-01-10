(function () {
  let kakaoRef, mapRef;
  let startMarker,
    endMarker,
    originMarker,
    waypointsMarkers = [],
    startStationMarker,
    endStationMarker;
  let bikeRouteOutline; // 어두운 외곽선
  let bikeRouteMain; // 메인 컬러 라인
  let bikeRouteDash; // 위에 얇은 점선

  let walkingToStartDot; // 출발지 -> 출발 대여소
  let walkingToEndDot; // 도착 대여소 -> 도착지
  let walkingToOriginDot; // 원점 -> 대여소 -> 원점
  let kakaoPathForFocusOnBound = [];

  const initRouteSetting = (kakao, map, DEFAULT_LAT, DEFAULT_LNG) => {
    kakaoRef = kakao;
    mapRef = map;

    const defaultPos = new kakaoRef.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG);

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
    const originMarkerSvg = buildMarkerHTML('원점', '#000000', '#FFFFFF');

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

    // 자전거 경로 3중 레이어
    bikeRouteOutline = new kakaoRef.maps.Polyline({
      path: [],
      strokeColor: '#006633',
      strokeWeight: 10,
      strokeOpacity: 0.45,
      strokeStyle: 'solid',
      zIndex: 3,
    });

    bikeRouteMain = new kakaoRef.maps.Polyline({
      path: [],
      strokeColor: '#00C267',
      strokeWeight: 8,
      strokeOpacity: 1,
      strokeStyle: 'solid',
      zIndex: 4,
    });

    bikeRouteDash = new kakaoRef.maps.Polyline({
      path: [],
      strokeColor: '#C8FFF1',
      strokeWeight: 3,
      strokeOpacity: 0.9,
      strokeStyle: 'shortdash',
      zIndex: 5,
    });

    // 도보 경로들 (점선)
    walkingToStartDot = new kakaoRef.maps.Polyline({
      path: [],
      strokeColor: '#006AFF',
      strokeWeight: 5,
      strokeOpacity: 1,
      strokeStyle: 'shortdot',
      zIndex: 6,
    });

    walkingToEndDot = new kakaoRef.maps.Polyline({
      path: [],
      strokeColor: '#FF0000',
      strokeWeight: 5,
      strokeOpacity: 1,
      strokeStyle: 'shortdot',
      zIndex: 6,
    });

    walkingToOriginDot = new kakaoRef.maps.Polyline({
      path: [],
      strokeColor: '#000000',
      strokeWeight: 5,
      strokeOpacity: 1,
      strokeStyle: 'shortdot',
      zIndex: 6,
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
      font-size="10" font-weight="bold"
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
    clearWaypointsMarkers();
    waypoints.forEach((waypoint, idx) => {
      const waypointPos = new kakaoRef.maps.LatLng(waypoint.lat, waypoint.lng);
      const waypointMarker = new kakaoRef.maps.CustomOverlay({
        position: waypointPos,
        content: getWaypointMarkerSvg(`경유${idx + 1}`),
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

  // 👉 LatLng[] 경로를 화면 좌표 기준으로 offset 시키는 헬퍼
  const offsetLatLngPath = (latLngPath, offsetX, offsetY) => {
    if (!mapRef || !kakaoRef || !Array.isArray(latLngPath)) return latLngPath;
    const projection = mapRef.getProjection();
    return latLngPath.map(latlng => {
      const pt = projection.pointFromCoords(latlng);
      const moved = new kakaoRef.maps.Point(pt.x + offsetX, pt.y + offsetY);
      return projection.coordsFromPoint(moved);
    });
  };

  // 대여소와 가장 가까운 좌표 추출
  const findNearestIndexOnPath = (coords, targetLat, targetLng) => {
    if (!Array.isArray(coords) || coords.length === 0) return -1;

    let bestIdx = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    coords.forEach(([lng, lat], idx) => {
      const dLng = lng - targetLng;
      const dLat = lat - targetLat;
      const score = Math.abs(dLng) + Math.abs(dLat);
      if (score < bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    });

    return bestIdx;
  };

  // startStation / endStation 기준으로 pathCoordinates를 세 구간으로 나누기
  const splitPathByStations = (coords, startStationPoint, endStationPoint) => {
    // 출발대여소는 항상 존재한다고 가정
    const firstIdx = findNearestIndexOnPath(
      coords,
      startStationPoint.lat,
      startStationPoint.lng,
    );

    // endStation이 startStation과 같은 경우 = 대여소 1개 (원점 ↔ 대여소 ↔ 원점 루프)
    if (
      endStationPoint.lat === startStationPoint.lat &&
      endStationPoint.lng === startStationPoint.lng
    ) {
      // 뒤에서부터 같은 대여소에 가장 가까운 인덱스 찾기 (마지막 대여소 지점)
      const reversedIdx = findNearestIndexOnPath(
        [...coords].reverse(),
        startStationPoint.lat,
        startStationPoint.lng,
      );
      const lastIdx = coords.length - 1 - reversedIdx;

      // 원점 → 대여소 + 대여소 → 원점 (도보)
      const walkingToOriginCoords = [
        ...coords.slice(0, firstIdx + 1),
        ...coords.slice(lastIdx),
      ];

      // 대여소 ↔ 대여소 구간만 자전거
      const bikeRouteCoords = coords.slice(firstIdx, lastIdx + 1);

      return {
        walkingToOriginCoords,
        bikeRouteCoords,
        walkingToStartCoords: [],
        walkingToEndCoords: [],
      };
    }

    // 출발/도착 대여소가 서로 다른 일반 케이스
    const startIdx = firstIdx;
    const endIdx = findNearestIndexOnPath(
      coords,
      endStationPoint.lat,
      endStationPoint.lng,
    );

    const sliceStart = Math.min(startIdx, endIdx);
    const sliceEnd = Math.max(startIdx, endIdx);

    return {
      walkingToStartCoords: coords.slice(0, sliceStart + 1),
      bikeRouteCoords: coords.slice(sliceStart, sliceEnd + 1),
      walkingToEndCoords: coords.slice(sliceEnd),
      walkingToOriginCoords: [],
    };
  };

  const applyRoundTripOffsetForLoop = (
    latLngPath,
    waypoints = null, // waypoint 좌표 배열
    outwardOffsetX = 8, // 가는 길: 화면 기준 오른쪽으로
    inwardOffsetX = -8, // 오는 길: 화면 기준 왼쪽으로
  ) => {
    if (!Array.isArray(latLngPath) || latLngPath.length < 4) {
      // 너무 짧으면 그냥 원본 사용
      return latLngPath;
    }

    const len = latLngPath.length;
    let midIdx = Math.floor(len / 2); // 기본값: 배열 중간

    // waypoint가 있으면 첫 번째 waypoint 좌표를 기준으로 midIdx 찾기
    if (waypoints && waypoints.length > 0) {
      const waypointCoord = waypoints[0];
      let bestIdx = midIdx;
      let bestDistance = Number.POSITIVE_INFINITY;

      latLngPath.forEach((latlng, idx) => {
        const dLat = latlng.getLat() - waypointCoord.lat;
        const dLng = latlng.getLng() - waypointCoord.lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < bestDistance) {
          bestDistance = dist;
          bestIdx = idx;
        }
      });
      midIdx = bestIdx;
    }

    // 앞쪽: 원점 → 턴포인트 (가는 길)
    const outwardPath = latLngPath.slice(0, midIdx + 1);
    // 뒤쪽: 턴포인트 → 원점 (오는 길)
    const inwardPath = latLngPath.slice(midIdx);

    const outwardOffsetPath = offsetLatLngPath(outwardPath, outwardOffsetX, 0);
    const inwardOffsetPath = offsetLatLngPath(inwardPath, inwardOffsetX, 0);

    // 두 경로를 이어 붙여서 하나의 폴리라인처럼 보이게
    return [...outwardOffsetPath, ...inwardOffsetPath];
  };

  // 내 위치 마커 및 오버레이 초기화
  const clearStaticPath = () => {
    if (startMarker) startMarker.setMap(null);
    if (endMarker) endMarker.setMap(null);
    if (originMarker) originMarker.setMap(null);
    if (startStationMarker) startStationMarker.setMap(null);
    if (endStationMarker) endStationMarker.setMap(null);
    if (kakaoPathForFocusOnBound.length > 0) kakaoPathForFocusOnBound = [];

    clearWaypointsMarkers();

    if (bikeRouteOutline) {
      bikeRouteOutline.setMap(null);
      bikeRouteOutline.setPath([]);
    }
    if (bikeRouteMain) {
      bikeRouteMain.setMap(null);
      bikeRouteMain.setPath([]);
    }
    if (bikeRouteDash) {
      bikeRouteDash.setMap(null);
      bikeRouteDash.setPath([]);
    }

    if (walkingToStartDot) {
      walkingToStartDot.setMap(null);
      walkingToStartDot.setPath([]);
    }

    if (walkingToEndDot) {
      walkingToEndDot.setMap(null);
      walkingToEndDot.setPath([]);
    }

    if (walkingToOriginDot) {
      walkingToOriginDot.setMap(null);
      walkingToOriginDot.setPath([]);
    }
  };

  const drawStaticPath = staticPathData => {
    const {
      routeType,
      startPoint,
      endPoint,
      waypoints,
      pathCoordinates,
      startStationPoint,
      endStationPoint,
    } = staticPathData;

    clearStaticPath();

    // 마커 찍기
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

    kakaoPathForFocusOnBound = convertToKakaoLatLngArray(pathCoordinates);

    const {
      walkingToStartCoords,
      bikeRouteCoords,
      walkingToEndCoords,
      walkingToOriginCoords,
    } = splitPathByStations(
      pathCoordinates,
      startStationPoint,
      endStationPoint,
    );

    // --- 도보 구간: 항상 약간 offset해서, 자전거 라인과 겹쳐도 평행하게 보이도록 ---

    if (walkingToStartCoords && walkingToStartCoords.length > 0) {
      const walkingToStartPath =
        convertToKakaoLatLngArray(walkingToStartCoords);
      walkingToStartDot.setPath(walkingToStartPath);
      walkingToStartDot.setMap(mapRef);
    }

    if (walkingToEndCoords && walkingToEndCoords.length > 0) {
      const walkingToEndPath = convertToKakaoLatLngArray(walkingToEndCoords);
      walkingToEndDot.setPath(walkingToEndPath);
      walkingToEndDot.setMap(mapRef);
    }

    if (walkingToOriginCoords && walkingToOriginCoords.length > 0) {
      let walkingToOriginPath = convertToKakaoLatLngArray(
        walkingToOriginCoords,
      );

      //   원점→대여소 / 대여소→원점 을 나눠서 각각 좌우로 벌려줌
      if (routeType === 'loop' && waypoints && waypoints.length === 1) {
        const len = walkingToOriginPath.length;
        const midIdx = Math.floor(len / 2);

        // 앞: 원점 → 대여소
        const outward = walkingToOriginPath.slice(0, midIdx + 1);
        // 뒤: 대여소 → 원점
        const inward = walkingToOriginPath.slice(midIdx);

        // 화면 기준: 위쪽으로 올리면서, 갈 때는 오른쪽 / 올 때는 왼쪽
        const outwardOffset = offsetLatLngPath(outward, 6, -10);
        const inwardOffset = offsetLatLngPath(inward, -6, -10);

        walkingToOriginPath = [...outwardOffset, ...inwardOffset];
      } else {
        // 일반 케이스는 기존처럼 그냥 위로만 살짝 올림
        walkingToOriginPath = offsetLatLngPath(walkingToOriginPath, 0, -10);
      }

      walkingToOriginDot.setPath(walkingToOriginPath);
      walkingToOriginDot.setMap(mapRef);
    }

    // --- 자전거 구간 ---
    if (bikeRouteCoords && bikeRouteCoords.length > 0) {
      let bikeRouteKaKaoPath = convertToKakaoLatLngArray(bikeRouteCoords);

      // ✅ 왕복 루프 + 경유지가 1개일 때:
      //    → 가는 길은 도로 우측, 오는 길은 도로 좌측으로 살짝 벌려서 표시
      if (routeType === 'loop' && waypoints && waypoints.length === 1) {
        bikeRouteKaKaoPath = applyRoundTripOffsetForLoop(
          bikeRouteKaKaoPath,
          waypoints, // waypoint 좌표 기준으로 분할
          8, // outward: 오른쪽으로 8px 정도
          -8, // inward: 왼쪽으로 8px 정도
        );
      }

      if (bikeRouteOutline) {
        bikeRouteOutline.setPath(bikeRouteKaKaoPath);
        bikeRouteOutline.setMap(mapRef);
      }

      if (bikeRouteMain) {
        bikeRouteMain.setPath(bikeRouteKaKaoPath);
        bikeRouteMain.setMap(mapRef);
      }

      if (bikeRouteDash) {
        bikeRouteDash.setPath(bikeRouteKaKaoPath);
        bikeRouteDash.setMap(mapRef);
      }

      focusOnStaticPath();
      return;
    }
  };

  // 바운드 맞추기
  const focusOnStaticPath = () => {
    const bounds = new kakaoRef.maps.LatLngBounds();
    kakaoPathForFocusOnBound.forEach(latlng => bounds.extend(latlng));
    mapRef.setBounds(bounds, 100);
  };

  window.Route = {
    initRouteSetting,
    drawStaticPath,
    clearStaticPath,
    focusOnStaticPath,
  };
})();
