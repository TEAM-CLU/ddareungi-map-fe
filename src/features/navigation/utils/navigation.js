/* global kakao */
(function () {
  let kakaoRef, mapRef;
  let startMarker,
    endMarker,
    waypointMarkers = [];
  let traveledLine, remainingLine;
  let walkingToStartDot,
    walkingToStartDotTraveled,
    walkingToEndDot,
    walkingToEndDotTraveled,
    walkingToOriginOutDot,
    walkingToOriginOutDotTraveled,
    walkingToOriginInDot,
    walkingToOriginInDotTraveled;
  let navigationCoords = [];
  let navigationPathLatLng = [];
  let cumulativeDistances = [];
  let lastAcceptedIndex = null;
  let lastSmoothedPosition = null;
  let arrivalNotified = false;
  let arrivalRadiusMeter = 30;
  let isNavigationActive = false;
  let bikeIndexedPath = [];
  let walkingIndexedPaths = {
    start: [],
    end: [],
    originOut: [],
    originIn: [],
  };

  const SEARCH_WINDOW_BACK = 20;
  const SEARCH_WINDOW_FORWARD = 60;
  const MAX_SNAP_DISTANCE_M = 45;
  const MAX_FORWARD_DISTANCE_M = 80;
  const MAX_ACCEPTABLE_ACCURACY_M = 80;
  const SMOOTH_ALPHA = 0.5;

  const initNavigationSetting = (kakao, map, DEFAULT_LAT, DEFAULT_LNG) => {
    kakaoRef = kakao;
    mapRef = map;
    const defaultPos = new kakaoRef.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG);

    const buildMarkerHTML = label => `
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40" style="display:block">
    <path d="M32.001 16.8882C32.001 29.333 16.0005 40 16.0005 40C16.0005 40 0 29.333 0 16.8882C0 8.05136 7.16366 0.8877 16.0005 0.8877C24.8373 0.8877 32.001 8.05136 32.001 16.8882Z"
      fill="#01DA86" stroke="#FFFFFF" stroke-width="2"/>
    <text x="16" y="16" text-anchor="middle"
      alignment-baseline="central" dy=".35em"
      font-family="Pretendard, 'Noto Sans KR', Arial, sans-serif"
      font-size="12" font-weight="bold"
      fill="#111">
      ${label}
    </text>
  </svg>
`;

    startMarker = new kakaoRef.maps.CustomOverlay({
      position: defaultPos,
      content: buildMarkerHTML('S'),
      yAnchor: 1,
      zIndex: 10,
    });

    endMarker = new kakaoRef.maps.CustomOverlay({
      position: defaultPos,
      content: buildMarkerHTML('E'),
      yAnchor: 1,
      zIndex: 10,
    });

    traveledLine = new kakaoRef.maps.Polyline({
      path: [],
      strokeColor: '#B0B0B0',
      strokeWeight: 8,
      strokeOpacity: 1,
      strokeStyle: 'solid',
      zIndex: 3,
    });

    remainingLine = new kakaoRef.maps.Polyline({
      path: [],
      strokeColor: '#01DA86',
      strokeWeight: 8,
      strokeOpacity: 1,
      strokeStyle: 'solid',
      zIndex: 4,
    });

    const buildDotLine = color =>
      new kakaoRef.maps.Polyline({
        path: [],
        strokeColor: color,
        strokeWeight: 5,
        strokeOpacity: 1,
        strokeStyle: 'shortdot',
        zIndex: 6,
      });

    walkingToStartDot = buildDotLine('#006AFF');
    walkingToStartDotTraveled = buildDotLine('#B0B0B0');
    walkingToEndDot = buildDotLine('#FF0000');
    walkingToEndDotTraveled = buildDotLine('#B0B0B0');
    walkingToOriginOutDot = buildDotLine('#000000');
    walkingToOriginOutDotTraveled = buildDotLine('#B0B0B0');
    walkingToOriginInDot = buildDotLine('#000000');
    walkingToOriginInDotTraveled = buildDotLine('#B0B0B0');
  };

  const clearWaypointMarkers = () => {
    if (waypointMarkers.length === 0) return;
    waypointMarkers.forEach(marker => marker.setMap(null));
    waypointMarkers = [];
  };

  const toRad = deg => (deg * Math.PI) / 180;

  const distanceMeter = (a, b) => {
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const h =
      sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const buildCumulativeDistances = coords => {
    const distances = [0];
    for (let i = 1; i < coords.length; i += 1) {
      distances[i] = distances[i - 1] + distanceMeter(coords[i - 1], coords[i]);
    }
    return distances;
  };

  const smoothPosition = (lat, lng) => {
    if (!lastSmoothedPosition) {
      lastSmoothedPosition = { lat, lng };
      return lastSmoothedPosition;
    }
    const next = {
      lat: lastSmoothedPosition.lat * (1 - SMOOTH_ALPHA) + lat * SMOOTH_ALPHA,
      lng: lastSmoothedPosition.lng * (1 - SMOOTH_ALPHA) + lng * SMOOTH_ALPHA,
    };
    lastSmoothedPosition = next;
    return next;
  };

  const findNearestIndexInRange = (coords, target, startIdx, endIdx) => {
    let bestIdx = startIdx;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let i = startIdx; i <= endIdx; i += 1) {
      const dist = distanceMeter(coords[i], target);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestIdx = i;
      }
    }
    return { index: bestIdx, distance: bestDistance };
  };

  const setPolylinePath = (polyline, path) => {
    if (!polyline) return;
    if (!path || path.length === 0) {
      polyline.setMap(null);
      polyline.setPath([]);
      return;
    }
    polyline.setPath(path);
    polyline.setMap(mapRef);
  };

  const splitIndexedPath = (indexedPath, cutoffIndex) => {
    const traveled = [];
    const remaining = [];
    if (!Array.isArray(indexedPath) || indexedPath.length === 0) {
      return { traveled, remaining };
    }
    indexedPath.forEach(item => {
      if (item.index <= cutoffIndex) traveled.push(item.latlng);
      if (item.index >= cutoffIndex) remaining.push(item.latlng);
    });
    return { traveled, remaining };
  };

  const offsetLatLngPath = (indexedPath, offsetX, offsetY) => {
    if (!mapRef || !kakaoRef || !Array.isArray(indexedPath)) return indexedPath;
    const projection = mapRef.getProjection();
    return indexedPath.map(item => {
      const pt = projection.pointFromCoords(item.latlng);
      const moved = new kakaoRef.maps.Point(pt.x + offsetX, pt.y + offsetY);
      return {
        ...item,
        latlng: projection.coordsFromPoint(moved),
      };
    });
  };

  const buildIndexedPath = (coords, startIdx, endIdx) => {
    const path = [];
    for (let i = startIdx; i <= endIdx; i += 1) {
      const coord = coords[i];
      path.push({
        index: i,
        latlng: new kakaoRef.maps.LatLng(coord.lat, coord.lng),
      });
    }
    return path;
  };

  const findNearestIndexOnPath = (coords, targetLat, targetLng) => {
    if (!Array.isArray(coords) || coords.length === 0) return -1;

    let bestIdx = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    coords.forEach((coord, idx) => {
      const dLng = coord.lng - targetLng;
      const dLat = coord.lat - targetLat;
      const score = Math.abs(dLng) + Math.abs(dLat);
      if (score < bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    });

    return bestIdx;
  };

  const buildSegmentPaths = (
    coords,
    routeType,
    startStationPoint,
    endStationPoint,
    waypoints,
  ) => {
    walkingIndexedPaths = {
      start: [],
      end: [],
      originOut: [],
      originIn: [],
    };
    bikeIndexedPath = [];

    if (!startStationPoint || !endStationPoint) {
      bikeIndexedPath = buildIndexedPath(coords, 0, coords.length - 1);
      return;
    }

    const firstIdx = findNearestIndexOnPath(
      coords,
      startStationPoint.lat,
      startStationPoint.lng,
    );
    if (firstIdx < 0) {
      bikeIndexedPath = buildIndexedPath(coords, 0, coords.length - 1);
      return;
    }

    if (
      routeType === 'loop' &&
      startStationPoint.lat === endStationPoint.lat &&
      startStationPoint.lng === endStationPoint.lng
    ) {
      const reversedIdx = findNearestIndexOnPath(
        [...coords].reverse(),
        startStationPoint.lat,
        startStationPoint.lng,
      );
      const lastIdx = coords.length - 1 - reversedIdx;

      const outward = buildIndexedPath(coords, 0, firstIdx);
      const inward = buildIndexedPath(coords, lastIdx, coords.length - 1);

      if (waypoints && waypoints.length === 1) {
        walkingIndexedPaths.originOut = offsetLatLngPath(outward, 6, -10);
        walkingIndexedPaths.originIn = offsetLatLngPath(inward, -6, -10);
      } else {
        walkingIndexedPaths.originOut = offsetLatLngPath(outward, 0, -10);
        walkingIndexedPaths.originIn = offsetLatLngPath(inward, 0, -10);
      }

      bikeIndexedPath = buildIndexedPath(coords, firstIdx, lastIdx);
      return;
    }

    const startIdx = firstIdx;
    const endIdx = findNearestIndexOnPath(
      coords,
      endStationPoint.lat,
      endStationPoint.lng,
    );
    if (endIdx < 0) {
      bikeIndexedPath = buildIndexedPath(coords, 0, coords.length - 1);
      return;
    }
    const sliceStart = Math.min(startIdx, endIdx);
    const sliceEnd = Math.max(startIdx, endIdx);

    walkingIndexedPaths.start = buildIndexedPath(coords, 0, sliceStart);
    walkingIndexedPaths.end = buildIndexedPath(
      coords,
      sliceEnd,
      coords.length - 1,
    );
    bikeIndexedPath = buildIndexedPath(coords, sliceStart, sliceEnd);
  };

  const updateNavigationPolylines = () => {
    if (!mapRef || navigationPathLatLng.length === 0) return;
    const splitIndex =
      lastAcceptedIndex === null ? 0 : Math.max(0, lastAcceptedIndex);

    if (bikeIndexedPath.length > 0) {
      const { traveled, remaining } = splitIndexedPath(
        bikeIndexedPath,
        splitIndex,
      );
      setPolylinePath(traveledLine, traveled);
      setPolylinePath(remainingLine, remaining);
    } else {
      traveledLine.setPath(navigationPathLatLng.slice(0, splitIndex + 1));
      remainingLine.setPath(navigationPathLatLng.slice(splitIndex));
      traveledLine.setMap(mapRef);
      remainingLine.setMap(mapRef);
    }

    const startSplit = splitIndexedPath(walkingIndexedPaths.start, splitIndex);
    setPolylinePath(walkingToStartDotTraveled, startSplit.traveled);
    setPolylinePath(walkingToStartDot, startSplit.remaining);

    const endSplit = splitIndexedPath(walkingIndexedPaths.end, splitIndex);
    setPolylinePath(walkingToEndDotTraveled, endSplit.traveled);
    setPolylinePath(walkingToEndDot, endSplit.remaining);

    const originOutSplit = splitIndexedPath(
      walkingIndexedPaths.originOut,
      splitIndex,
    );
    setPolylinePath(walkingToOriginOutDotTraveled, originOutSplit.traveled);
    setPolylinePath(walkingToOriginOutDot, originOutSplit.remaining);

    const originInSplit = splitIndexedPath(
      walkingIndexedPaths.originIn,
      splitIndex,
    );
    setPolylinePath(walkingToOriginInDotTraveled, originInSplit.traveled);
    setPolylinePath(walkingToOriginInDot, originInSplit.remaining);
  };

  const notifyArrivalIfNeeded = position => {
    if (arrivalNotified || navigationCoords.length === 0) return;
    const endCoord = navigationCoords[navigationCoords.length - 1];
    const distanceToEnd = distanceMeter(position, endCoord);
    if (distanceToEnd > arrivalRadiusMeter) return;

    arrivalNotified = true;
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({
        type: 'navigationArrived',
        lat: position.lat,
        lng: position.lng,
        distanceMeter: Math.round(distanceToEnd),
      }),
    );
  };

  const updateNavigationLocation = (lat, lng, accuracy) => {
    if (!isNavigationActive || navigationCoords.length === 0) return;
    if (accuracy != null && accuracy > MAX_ACCEPTABLE_ACCURACY_M) return;

    const smoothed = smoothPosition(lat, lng);

    let startIdx = 0;
    let endIdx = navigationCoords.length - 1;

    if (lastAcceptedIndex !== null) {
      startIdx = Math.max(0, lastAcceptedIndex - SEARCH_WINDOW_BACK);
      endIdx = Math.min(
        navigationCoords.length - 1,
        lastAcceptedIndex + SEARCH_WINDOW_FORWARD,
      );
    }

    const { index: nearestIndex, distance } = findNearestIndexInRange(
      navigationCoords,
      smoothed,
      startIdx,
      endIdx,
    );

    const allowedSnapDistance = Math.max(
      MAX_SNAP_DISTANCE_M,
      (accuracy ?? 0) * 1.2,
    );

    if (distance > allowedSnapDistance) return;

    if (lastAcceptedIndex !== null) {
      if (nearestIndex < lastAcceptedIndex) return;
      const forwardDistance =
        cumulativeDistances[nearestIndex] -
        cumulativeDistances[lastAcceptedIndex];
      if (forwardDistance > MAX_FORWARD_DISTANCE_M) return;
    }

    lastAcceptedIndex = nearestIndex;
    updateNavigationPolylines();
    notifyArrivalIfNeeded(smoothed);
  };

  const clearNavigationPath = () => {
    isNavigationActive = false;
    arrivalNotified = false;
    navigationCoords = [];
    navigationPathLatLng = [];
    cumulativeDistances = [];
    lastAcceptedIndex = null;
    lastSmoothedPosition = null;

    if (startMarker) startMarker.setMap(null);
    if (endMarker) endMarker.setMap(null);
    clearWaypointMarkers();

    if (traveledLine) {
      traveledLine.setMap(null);
      traveledLine.setPath([]);
    }
    if (remainingLine) {
      remainingLine.setMap(null);
      remainingLine.setPath([]);
    }

    setPolylinePath(walkingToStartDot, []);
    setPolylinePath(walkingToStartDotTraveled, []);
    setPolylinePath(walkingToEndDot, []);
    setPolylinePath(walkingToEndDotTraveled, []);
    setPolylinePath(walkingToOriginOutDot, []);
    setPolylinePath(walkingToOriginOutDotTraveled, []);
    setPolylinePath(walkingToOriginInDot, []);
    setPolylinePath(walkingToOriginInDotTraveled, []);
  };

  const drawNavigationPath = navigationPathData => {
    if (!navigationPathData) return;
    clearNavigationPath();

    const {
      pathCoordinates,
      startPoint,
      endPoint,
      waypoints,
      arrivalRadiusMeter: arrivalRadius,
      routeType,
      startStationPoint,
      endStationPoint,
    } = navigationPathData;

    if (!Array.isArray(pathCoordinates) || pathCoordinates.length === 0) return;

    arrivalRadiusMeter = arrivalRadius ?? 30;

    navigationCoords = pathCoordinates.map(([lng, lat]) => ({
      lat,
      lng,
    }));
    navigationPathLatLng = navigationCoords.map(
      coord => new kakaoRef.maps.LatLng(coord.lat, coord.lng),
    );
    cumulativeDistances = buildCumulativeDistances(navigationCoords);
    lastAcceptedIndex = 0;
    isNavigationActive = true;

    buildSegmentPaths(
      navigationCoords,
      routeType,
      startStationPoint,
      endStationPoint,
      waypoints,
    );

    const [startLng, startLat] = startPoint ?? pathCoordinates[0];
    const [endLng, endLat] =
      endPoint ?? pathCoordinates[pathCoordinates.length - 1];

    const startPos = new kakaoRef.maps.LatLng(startLat, startLng);
    const endPos = new kakaoRef.maps.LatLng(endLat, endLng);

    startMarker.setPosition(startPos);
    startMarker.setMap(mapRef);
    endMarker.setPosition(endPos);
    endMarker.setMap(mapRef);

    if (Array.isArray(waypoints) && waypoints.length > 0) {
      waypoints.forEach((waypoint, idx) => {
        const waypointPos = new kakaoRef.maps.LatLng(
          waypoint.lat,
          waypoint.lng,
        );
        const waypointMarker = new kakaoRef.maps.CustomOverlay({
          position: waypointPos,
          content: `
            <div style="display:block">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40" style="display:block">
                <path d="M32.001 16.8882C32.001 29.333 16.0005 40 16.0005 40C16.0005 40 0 29.333 0 16.8882C0 8.05136 7.16366 0.8877 16.0005 0.8877C24.8373 0.8877 32.001 8.05136 32.001 16.8882Z"
                  fill="#01DA86" stroke="#FFFFFF" stroke-width="2"/>
                <text x="16" y="16" text-anchor="middle"
                  alignment-baseline="central" dy=".35em"
                  font-family="Pretendard, 'Noto Sans KR', Arial, sans-serif"
                  font-size="10" font-weight="bold"
                  fill="#111">
                  W${idx + 1}
                </text>
              </svg>
            </div>
          `,
          yAnchor: 1,
          zIndex: 10,
        });
        waypointMarker.setMap(mapRef);
        waypointMarkers.push(waypointMarker);
      });
    }

    updateNavigationPolylines();
  };

  window.Navigation = {
    initNavigationSetting,
    drawNavigationPath,
    updateNavigationLocation,
    clearNavigationPath,
  };

  Object.defineProperty(window.Navigation, 'isNavigationActive', {
    get() {
      return isNavigationActive;
    },
  });
})();
