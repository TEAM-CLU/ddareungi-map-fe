(function () {
  let kakaoRef, mapRef;
  let bookmarkMarkers = [];

  const initBookmarkSetting = (kakao, map) => {
    kakaoRef = kakao;
    mapRef = map;
    ensureNoTapHighlightCSS();
  };

  // 모바일 브라우저에서 탭 하이라이트, 텍스트 선택, 포커스 아웃라인 제거
  const ensureNoTapHighlightCSS = () => {
    if (document.getElementById('no-tap-style')) return;
    const s = document.createElement('style');
    s.id = 'no-tap-style';
    s.textContent = `
    .station-marker, .station-marker * {
      -webkit-tap-highlight-color: rgba(0,0,0,0);
      -webkit-touch-callout: none;
      user-select: none;
      -webkit-user-select: none;
      outline: none;
    }
    .station-marker:active { background: transparent !important; }
    .station-marker svg text {
      pointer-events: none;
      user-select: none;
      -webkit-user-select: none;
    }
  `;
    document.head.appendChild(s);
  };

  /**
   * [가독성 업그레이드 버전]
   * 둥근 원형 마커 안에 별 아이콘이 들어간 스타일
   * 구조: [그림자] -> [흰색 테두리 원] -> [색상 원] -> [흰색 별 아이콘]
   */
  const getBookmarkMarkerSvg = (color = '#FFC107', uniqueId) => `
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter_badge_shadow_${uniqueId})">
        <circle cx="22" cy="20" r="16" fill="white"/>
        
        <circle cx="22" cy="20" r="14" fill="${color}"/>
        
        <path d="M22 13L24.5 17.8L29.8 18.3L25.8 21.9L27 27.1L22 24.2L17 27.1L18.2 21.9L14.2 18.3L19.5 17.8L22 13Z" 
          fill="white"
        />
      </g>
      <defs>
        <filter id="filter_badge_shadow_${uniqueId}" x="0" y="0" width="44" height="44" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="3"/>
          <feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
        </filter>
      </defs>
    </svg>
  `;

  // DOM 엘리먼트 생성
  const buildBookmarkContentElement = (bookmark, index) => {
    const wrap = document.createElement('div');
    const color = bookmark.color || '#FFC107';

    // SVG 필터 ID 충돌 방지를 위한 고유 ID 생성
    const uniqueId = `bm_${index}_${Math.floor(Math.random() * 1000)}`;
    wrap.innerHTML = getBookmarkMarkerSvg(color, uniqueId);

    wrap.className = 'bookmark-marker';
    wrap.style.width = '44px';
    wrap.style.height = '44px';
    wrap.style.display = 'flex';
    wrap.style.alignItems = 'center';
    wrap.style.justifyContent = 'center';
    wrap.style.cursor = 'pointer';
    wrap.style.zIndex = '20';
    wrap.style.transform = 'translateZ(0)';
    wrap.style.background = 'transparent';
    return wrap;
  };

  // 클릭 이벤트 바인딩
  const bindOverlayClick = (marker, bookmarkData) => {
    const content = marker.getContent();
    if (!content) return;

    content.onclick = null;
    content.onclick = () => {
      mapRef.setCenter(marker.getPosition());

      const currentLevel = mapRef.getLevel();
      if (currentLevel > 3) {
        mapRef.setLevel(3, { animate: true });
      }

      window.ReactNativeWebView?.postMessage(
        JSON.stringify({
          type: 'clickBookmarkMarker',
          bookmarkData: bookmarkData,
        }),
      );
    };
  };

  const clearBookmarkMarkers = () => {
    if (bookmarkMarkers.length > 0) {
      bookmarkMarkers.forEach(({ marker }) => marker.setMap(null));
      bookmarkMarkers = [];
    }
  };

  const createBookmarkMarkers = bookmarksList => {
    clearBookmarkMarkers();

    if (!bookmarksList || bookmarksList.length === 0) return;

    bookmarksList.forEach((bookmark, index) => {
      if (!bookmark.latitude || !bookmark.longitude) return;

      const position = new kakaoRef.maps.LatLng(
        bookmark.latitude,
        bookmark.longitude,
      );

      const contentElement = buildBookmarkContentElement(bookmark, index);

      const marker = new kakaoRef.maps.CustomOverlay({
        position: position,
        content: contentElement,
        xAnchor: 0.5,
        yAnchor: 0.45,
        zIndex: 20,
        clickable: true,
      });

      marker.setMap(mapRef);

      bookmarkMarkers.push({
        id: bookmark.id,
        marker: marker,
        metaData: bookmark,
      });

      bindOverlayClick(marker, bookmark);
    });
  };

  const toggleBookmarkMarkers = isVisible => {
    alert(
      `토글 신호 받음! 상태: ${isVisible}, 마커개수: ${bookmarkMarkers.length}`,
    );
    if (bookmarkMarkers.length === 0) return;
    bookmarkMarkers.forEach(({ marker }) => {
      marker.setMap(isVisible ? mapRef : null);
    });
  };

  const focusOnBookmark = bookmarkId => {
    const target = bookmarkMarkers.find(bookmark => bookmark.id === bookmarkId);
    if (target) {
      mapRef.setCenter(target.marker.getPosition());
      mapRef.setLevel(3, { animate: true });
    }
  };

  const destroyBookmark = () => {
    clearBookmarkMarkers();
  };

  window.Bookmark = {
    initBookmarkSetting,
    createBookmarkMarkers,
    toggleBookmarkMarkers,
    focusOnBookmark,
    destroyBookmark,
  };
})();
