(function () {
  let kakaoRef, mapRef;
  let startMarker,
    endMarker,
    originMarker,
    waypointsMarkers = [],
    startStationMarker,
    endStationMarker;

  // 네비게이션 경로 폴리라인들 (interval별 관리)
  let navigationBikeRouteOutlineList = []; // 어두운 외곽선 리스트
  let navigationBikeRouteMainList = []; // 메인 컬러 라인 리스트
  let navigationBikeRouteDashList = []; // 위에 얇은 점선 리스트

  let navigationWalkingToStartDot; // 출발지 -> 출발 대여소
  let navigationWalkingToEndDot; // 도착 대여소 -> 도착지
  let navigationWalkingToOriginDot; // 원점 -> 대여소 -> 원점

  // interval 경계 표시 마커들
  let intervalBoundaryMarkers = [];

  let kakaoPathForFocusOnBound = [];

  const initNavigationSetting = (kakao, map, DEFAULT_LAT, DEFAULT_LNG) => {
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

    // 도보 경로들 (점선)
    navigationWalkingToStartDot = new kakaoRef.maps.Polyline({
      path: [],
      strokeColor: '#006AFF',
      strokeWeight: 5,
      strokeOpacity: 1,
      strokeStyle: 'shortdot',
      zIndex: 6,
    });

    navigationWalkingToEndDot = new kakaoRef.maps.Polyline({
      path: [],
      strokeColor: '#FF0000',
      strokeWeight: 5,
      strokeOpacity: 1,
      strokeStyle: 'shortdot',
      zIndex: 6,
    });

    navigationWalkingToOriginDot = new kakaoRef.maps.Polyline({
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

  // interval 경계 표시 마커 생성 함수 (원형 + 인덱스)
  const getIntervalBoundaryMarkerSvg = (index = 0) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="display:block">
    <circle cx="12" cy="12" r="10" fill="#FFFFFF" stroke="#01DA86" stroke-width="2"/>
    <text x="12" y="12.5" text-anchor="middle"
      alignment-baseline="central"
      font-family="Pretendard, -apple-system, sans-serif"
      font-size="11" font-weight="600"
      fill="#414548">
      ${index}
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

  const clearIntervalBoundaryMarkers = () => {
    if (intervalBoundaryMarkers.length > 0) {
      intervalBoundaryMarkers.forEach(marker => marker.setMap(null));
      intervalBoundaryMarkers = [];
    }
  };

  const createIntervalBoundaryMarkers = (fullPathCoordinateList, intervals) => {
    clearIntervalBoundaryMarkers();

    if (!intervals || intervals.length === 0) return;

    // 모든 interval의 시작점에 마커 생성 (0부터 시작)
    intervals.forEach((interval, idx) => {
      const boundaryIdx = interval[0]; // interval 시작 인덱스
      if (boundaryIdx >= 0 && boundaryIdx < fullPathCoordinateList.length) {
        const [lng, lat] = fullPathCoordinateList[boundaryIdx];
        const boundaryPos = new kakaoRef.maps.LatLng(lat, lng);

        const boundaryMarker = new kakaoRef.maps.CustomOverlay({
          position: boundaryPos,
          content: getIntervalBoundaryMarkerSvg(idx), // 0부터 시작
          yAnchor: 0.5,
          xAnchor: 0.5,
          zIndex: 15,
        });

        boundaryMarker.setMap(mapRef);
        intervalBoundaryMarkers.push(boundaryMarker);
      }
    });

    // 마지막 interval의 끝점에도 마커 추가 (intervals.length)
    const lastInterval = intervals[intervals.length - 1];
    const lastBoundaryIdx = lastInterval[1]; // 마지막 interval의 끝 인덱스
    if (
      lastBoundaryIdx >= 0 &&
      lastBoundaryIdx < fullPathCoordinateList.length
    ) {
      const [lng, lat] = fullPathCoordinateList[lastBoundaryIdx];
      const boundaryPos = new kakaoRef.maps.LatLng(lat, lng);

      const lastBoundaryMarker = new kakaoRef.maps.CustomOverlay({
        position: boundaryPos,
        content: getIntervalBoundaryMarkerSvg(intervals.length), // 총 interval 개수
        yAnchor: 0.5,
        xAnchor: 0.5,
        zIndex: 15,
      });

      lastBoundaryMarker.setMap(mapRef);
      intervalBoundaryMarkers.push(lastBoundaryMarker);
    }
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
    outwardOffsetX = 8, // 가는 길: 화면 기준 오른쪽으로
    inwardOffsetX = -8, // 오는 길: 화면 기준 왼쪽으로
  ) => {
    if (!Array.isArray(latLngPath) || latLngPath.length < 4) {
      // 너무 짧으면 그냥 원본 사용
      return latLngPath;
    }

    const len = latLngPath.length;
    const midIdx = Math.floor(len / 2);

    // 앞쪽: 원점 → 턴포인트 (가는 길)
    const outwardPath = latLngPath.slice(0, midIdx + 1);
    // 뒤쪽: 턴포인트 → 원점 (오는 길)
    const inwardPath = latLngPath.slice(midIdx);

    const outwardOffsetPath = offsetLatLngPath(outwardPath, outwardOffsetX, 0);
    const inwardOffsetPath = offsetLatLngPath(inwardPath, inwardOffsetX, 0);

    // 두 경로를 이어 붙여서 하나의 폴리라인처럼 보이게
    return [...outwardOffsetPath, ...inwardOffsetPath];
  };

  // 네비게이션 경로 및 마커 전체 초기화
  const clearNavigationPath = () => {
    if (startMarker) startMarker.setMap(null);
    if (endMarker) endMarker.setMap(null);
    if (originMarker) originMarker.setMap(null);
    if (startStationMarker) startStationMarker.setMap(null);
    if (endStationMarker) endStationMarker.setMap(null);
    if (kakaoPathForFocusOnBound.length > 0) kakaoPathForFocusOnBound = [];

    clearWaypointsMarkers();
    clearIntervalBoundaryMarkers();

    // 기존 interval별 폴리라인들 전부 제거
    navigationBikeRouteOutlineList.forEach(polyline => {
      if (polyline) {
        polyline.setMap(null);
      }
    });
    navigationBikeRouteMainList.forEach(polyline => {
      if (polyline) {
        polyline.setMap(null);
      }
    });
    navigationBikeRouteDashList.forEach(polyline => {
      if (polyline) {
        polyline.setMap(null);
      }
    });

    navigationBikeRouteOutlineList = [];
    navigationBikeRouteMainList = [];
    navigationBikeRouteDashList = [];

    if (navigationWalkingToStartDot) {
      navigationWalkingToStartDot.setMap(null);
      navigationWalkingToStartDot.setPath([]);
    }

    if (navigationWalkingToEndDot) {
      navigationWalkingToEndDot.setMap(null);
      navigationWalkingToEndDot.setPath([]);
    }

    if (navigationWalkingToOriginDot) {
      navigationWalkingToOriginDot.setMap(null);
      navigationWalkingToOriginDot.setPath([]);
    }
  };

  // 네비게이션 경로 그리기 (interval 기반)
  const drawNavigationPath = navigationPathData => {
    const {
      routeType,
      startPoint,
      endPoint,
      waypoints,
      fullPathCoordinateList,
      intervals,
      currentIntervalIndex,
      startStationPoint,
      endStationPoint,
    } = navigationPathData;

    clearNavigationPath();

    // 마커 찍기 - selectedRouteData 기반
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

    // interval 경계 마커 생성
    createIntervalBoundaryMarkers(fullPathCoordinateList, intervals);

    kakaoPathForFocusOnBound = convertToKakaoLatLngArray(
      fullPathCoordinateList,
    );

    const {
      walkingToStartCoords,
      bikeRouteCoords,
      walkingToEndCoords,
      walkingToOriginCoords,
    } = splitPathByStations(
      fullPathCoordinateList,
      startStationPoint,
      endStationPoint,
    );

    // --- 도보 구간 그리기 ---
    if (walkingToStartCoords && walkingToStartCoords.length > 0) {
      const walkingToStartPath =
        convertToKakaoLatLngArray(walkingToStartCoords);
      navigationWalkingToStartDot.setPath(walkingToStartPath);
      navigationWalkingToStartDot.setMap(mapRef);
    }

    if (walkingToEndCoords && walkingToEndCoords.length > 0) {
      const walkingToEndPath = convertToKakaoLatLngArray(walkingToEndCoords);
      navigationWalkingToEndDot.setPath(walkingToEndPath);
      navigationWalkingToEndDot.setMap(mapRef);
    }

    if (walkingToOriginCoords && walkingToOriginCoords.length > 0) {
      const walkingToOriginPath = convertToKakaoLatLngArray(
        walkingToOriginCoords,
      );

      navigationWalkingToOriginDot.setPath(walkingToOriginPath);
      navigationWalkingToOriginDot.setMap(mapRef);
    }

    // --- 자전거 구간: interval별로 분리해서 그리기 ---
    if (bikeRouteCoords && bikeRouteCoords.length > 0 && intervals) {
      // splitPathByStations가 이미 정확한 bikeRouteCoords를 추출함
      // fullPathCoordinateList에서 bikeRouteCoords의 시작 위치를 찾음
      const [firstLng, firstLat] = bikeRouteCoords[0];

      const bikeStartIdx = fullPathCoordinateList.findIndex(
        ([lng, lat]) => lng === firstLng && lat === firstLat,
      );

      // bikeEndIdx는 시작 인덱스 + 길이 - 1 (수학적으로 정확)
      const bikeEndIdx = bikeStartIdx + bikeRouteCoords.length - 1;

      // 전체 자전거 구간을 LatLng로 변환 (네비게이션 모드에서는 offset 적용 안함)
      let fullBikeKakaoPath = convertToKakaoLatLngArray(bikeRouteCoords);

      intervals.forEach((interval, intervalIdx) => {
        const [intervalStart, intervalEnd] = interval;

        // 이 interval이 자전거 구간에 포함되는지 확인
        if (intervalEnd < bikeStartIdx || intervalStart > bikeEndIdx) {
          // 도보 구간이므로 건너뜀
          return;
        }

        // 자전거 구간 내에서의 실제 좌표 추출
        const actualStart = Math.max(intervalStart, bikeStartIdx);
        const actualEnd = Math.min(intervalEnd, bikeEndIdx);

        // fullPathCoordinateList 기준 인덱스를 bikeRouteCoords/fullBikeKakaoPath 기준으로 변환
        const intervalStartInBike = actualStart - bikeStartIdx;
        const intervalEndInBike = actualEnd - bikeStartIdx;

        // offset이 이미 적용된 fullBikeKakaoPath에서 해당 interval만 slice
        const intervalKakaoPath = fullBikeKakaoPath.slice(
          intervalStartInBike,
          intervalEndInBike + 1,
        );

        if (intervalKakaoPath.length === 0) return;

        // 지나온 구간인지 판단
        const isPassed = intervalIdx < currentIntervalIndex;

        // 지나온 구간은 회색으로 표시
        const outlineColor = isPassed ? '#999999' : '#006633';
        const mainColor = isPassed ? '#CCCCCC' : '#00C267';
        const dashColor = isPassed ? '#EEEEEE' : '#C8FFF1';

        // Outline (외곽선)
        const outlinePolyline = new kakaoRef.maps.Polyline({
          path: intervalKakaoPath,
          strokeColor: outlineColor,
          strokeWeight: 10,
          strokeOpacity: isPassed ? 0.3 : 0.45,
          strokeStyle: 'solid',
          zIndex: 3,
        });
        outlinePolyline.setMap(mapRef);
        navigationBikeRouteOutlineList.push(outlinePolyline);

        // Main (메인 컬러)
        const mainPolyline = new kakaoRef.maps.Polyline({
          path: intervalKakaoPath,
          strokeColor: mainColor,
          strokeWeight: 8,
          strokeOpacity: isPassed ? 0.5 : 1,
          strokeStyle: 'solid',
          zIndex: 4,
        });
        mainPolyline.setMap(mapRef);
        navigationBikeRouteMainList.push(mainPolyline);

        // Dash (점선)
        const dashPolyline = new kakaoRef.maps.Polyline({
          path: intervalKakaoPath,
          strokeColor: dashColor,
          strokeWeight: 3,
          strokeOpacity: isPassed ? 0.4 : 0.9,
          strokeStyle: 'shortdash',
          zIndex: 5,
        });
        dashPolyline.setMap(mapRef);
        navigationBikeRouteDashList.push(dashPolyline);
      });

      focusOnNavigationPath();
    }
  };

  // 현재 interval 업데이트 (지나온 구간 회색 처리)
  const updateNavigationCurrentInterval = updateData => {
    const { currentIntervalIndex, intervals, fullPathCoordinateList } =
      updateData;

    // 기존 폴리라인들을 업데이트
    intervals.forEach((interval, intervalIdx) => {
      if (intervalIdx >= navigationBikeRouteOutlineList.length) return;

      const isPassed = intervalIdx < currentIntervalIndex;

      // 색상 변경
      const outlineColor = isPassed ? '#999999' : '#006633';
      const mainColor = isPassed ? '#CCCCCC' : '#00C267';
      const dashColor = isPassed ? '#EEEEEE' : '#C8FFF1';

      const outlinePolyline = navigationBikeRouteOutlineList[intervalIdx];
      const mainPolyline = navigationBikeRouteMainList[intervalIdx];
      const dashPolyline = navigationBikeRouteDashList[intervalIdx];

      if (outlinePolyline) {
        outlinePolyline.setOptions({
          strokeColor: outlineColor,
          strokeOpacity: isPassed ? 0.3 : 0.45,
        });
      }

      if (mainPolyline) {
        mainPolyline.setOptions({
          strokeColor: mainColor,
          strokeOpacity: isPassed ? 0.5 : 1,
        });
      }

      if (dashPolyline) {
        dashPolyline.setOptions({
          strokeColor: dashColor,
          strokeOpacity: isPassed ? 0.4 : 0.9,
        });
      }
    });
  };

  // 바운드 맞추기
  const focusOnNavigationPath = () => {
    const bounds = new kakaoRef.maps.LatLngBounds();
    kakaoPathForFocusOnBound.forEach(latlng => bounds.extend(latlng));
    mapRef.setBounds(bounds, 100);
  };

  window.Navigation = {
    initNavigationSetting,
    drawNavigationPath,
    updateNavigationCurrentInterval,
    clearNavigationPath,
    focusOnNavigationPath,
  };
})();
