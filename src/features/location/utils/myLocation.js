(function () {
  // 관련 변수 선언
  let kakaoRef, mapRef;
  let myLocationMarker, myHeadingOverlay, outerCircle, innerCircle;
  let hasMoveToMyLocationRun = false;

  // 내 위치 관련 오버레이 정의 및 생성
  const initMyLocationSetting = (kakao, map, DEFAULT_LAT, DEFAULT_LNG) => {
    kakaoRef = kakao;
    mapRef = map;
    const defaultPos = new kakaoRef.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG);

    //  내 위치 마커 생성 및 초기세팅
    const myLocationSvg = `
                        <div style="
                          position: absolute;
                          top: 50%;
                          left: 50%;
                          transform: translate(-50%, -50%);
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          width: 23px;
                          height: 23px;
                        ">
                          <svg xmlns='http://www.w3.org/2000/svg' width='23' height='23' viewBox='0 0 23 23' fill='none'>
                            <circle cx='11.7393' cy='11.739' r='9.5' fill='#01DA86' stroke='white' stroke-width='3'/>
                          </svg>
                        </div>
                      `;
    myLocationMarker = new kakaoRef.maps.CustomOverlay({
      position: defaultPos,
      content: myLocationSvg,
      xAnchor: 0.5,
      yAnchor: 0.5,
      zIndex: 20,
    });
    myLocationMarker.setMap(mapRef);

    // 내 위치 방향 cone 생성 및 초기세팅
    const myHeadingSvg = `
                      <div id="myHeadingOverlay"
                          style="
                            position:absolute;
                            width:40px; height:40px;
                            transform-origin: 0px 1px;
                            transform: rotate(0deg);
                            pointer-events:none; z-index:2;">
                        <svg xmlns="http://www.w3.org/2000/svg"
                            width="40" height="40" viewBox="0 0 40 40" fill="none"
                            style="display:block; overflow:visible">
                          <path d="M0 1 L39 -11 A40 40 0 0 1 39 13 Z"
                                fill="url(#grad)" />
                          <defs>
                            <radialGradient id="grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
                                            gradientTransform="translate(0 1) scale(45)">
                              <stop offset="0" stop-color="#01EC91"/>
                              <stop offset="1" stop-color="#01EC91" stop-opacity="0"/>
                            </radialGradient>
                          </defs>
                        </svg>
                      </div>
                      `;

    myHeadingOverlay = new kakaoRef.maps.CustomOverlay({
      position: defaultPos,
      content: myHeadingSvg,
      xAnchor: 0,
      yAnchor: 0.5,
      zIndex: 1,
    });
    myHeadingOverlay.setMap(null); // 초기에는 숨김

    // 정확도 원
    outerCircle = new kakaoRef.maps.Circle({
      center: defaultPos,
      radius: 20, // 초기 반경
      strokeWeight: 0,
      fillColor: '#01DA86',
      fillOpacity: 0.1,
    });
    outerCircle.setMap(mapRef);
    innerCircle = new kakaoRef.maps.Circle({
      center: defaultPos,
      radius: 10, // 초기 반경
      strokeWeight: 0,
      fillColor: '#01DA86',
      fillOpacity: 0.2,
    });
    innerCircle.setMap(mapRef);
  };

  // 내 위치 업데이트
  const updateMyLocation = (lat, lng, accuracy) => {
    const updatedPosition = new kakaoRef.maps.LatLng(lat, lng);

    // 최초 위치로 이동
    if (!hasMoveToMyLocationRun && !window.isSelectedRouteDetailModalOpen) {
      mapRef.setCenter(updatedPosition);
      hasMoveToMyLocationRun = true;
    }
    myLocationMarker.setPosition(updatedPosition);
    myHeadingOverlay.setPosition(updatedPosition);
    outerCircle.setPosition(updatedPosition);
    innerCircle.setPosition(updatedPosition);
    // 정확도 반경 업데이트 (최소값 설정)
    outerCircle.setRadius(Math.max(accuracy, 15));
    innerCircle.setRadius(Math.max(accuracy / 2, 8));

    // 나침반 모드일 때만 내 위치 고정 이동
    if (window.isCompassMode) mapRef.panTo(updatedPosition);
  };

  // 내 위치 방향 업데이트
  const rotateMyHeading = heading => {
    if (!kakaoRef || !mapRef) {
      console.error('카카오맵 초기화 실패');
      return;
    }
    const myHeadingElement = document.getElementById('myHeadingOverlay');
    if (myHeadingElement) {
      myHeadingElement.style.transform = `rotate(${heading - 90}deg)`;
    }
  };

  // 나침반 오버레이 보이기/숨기기
  const setMyHeadingOverlayVisible = isCompassMode => {
    myHeadingOverlay.setMap(isCompassMode ? mapRef : null);
  };

  window.MyLocation = {
    initMyLocationSetting,
    updateMyLocation,
    rotateMyHeading,
    setMyHeadingOverlayVisible,
  };

  Object.defineProperty(window.MyLocation, 'myLocationMarker', {
    get() {
      return myLocationMarker;
    },
  });
})();
