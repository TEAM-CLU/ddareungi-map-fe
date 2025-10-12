(function () {
  let kakaoRef, mapRef;
  let stationMarker;
  let stationMarkers = [];

  const initStationSeting = (kakao, map) => {
    console.log('initStationSeting called');
    kakaoRef = kakao;
    mapRef = map;
  };

  const clearStationMarkers = () => {
    if (stationMarkers.length > 0) {
      stationMarkers.forEach(stationMarker => stationMarker.setMap(null));
      stationMarkers = [];
    }
  };

  // 경유지 마커 SVG 생성 함수
  const getStationMarkerSvg = (label = '') => `
<svg xmlns="http://www.w3.org/2000/svg" width="41" height="48" viewBox="0 0 41 48" fill="none">
  <g filter="url(#filter0_d)">
    <path fill-rule="evenodd" clip-rule="evenodd"
      d="M36 16.5C36 28.5556 20.5 38.8889 20.5 38.8889C20.5 38.8889 5 28.5556 5 16.5C5 7.93959 11.9396 1 20.5 1C29.0604 1 36 7.93959 36 16.5Z"
      fill="white" stroke="#01DA86" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <text
      x="20.5"
      y="14"
      text-anchor="middle"
      alignment-baseline="central"
      dy=".35em"
      fill="#414548"
      font-family="Pretendard, 'Noto Sans KR', Arial, sans-serif"
      font-size="15"
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

  const createStationMarkers = stationsDataList => {
    console.log('stationsDataList', stationsDataList);
    // 기존 대여소 마커 제거
    clearStationMarkers();

    // 새 stationsDataList 기반으로 마커 생성
    stationsDataList.forEach(station => {
      const stationPos = new kakaoRef.maps.LatLng(
        station.latitude,
        station.longitude,
      );
      stationMarker = new kakaoRef.maps.CustomOverlay({
        position: stationPos,
        content: getStationMarkerSvg(station.current_bikes), // label 자동 생성
        yAnchor: 1,
        zIndex: 11,
      });
      stationMarker.setMap(mapRef);
      stationMarkers.push(stationMarker);
    });
  };

  window.Station = {
    initStationSeting,
    createStationMarkers,
  };
})();
