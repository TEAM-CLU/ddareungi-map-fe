<div align="center">
  <img src="https://github.com/user-attachments/assets/b41b9529-d411-41db-a649-54c989320348" width="300" alt="따릉이맵 로고" />

<h1>🚲 따릉이맵 (Ddareungi Map)</h1>

  <p>
    서울 공공자전거(따릉이) 기반 스마트 모빌리티 서비스입니다.<br/>
    <b>도보 → 자전거 → 도보</b> 3단계를 하나로 연결하는 통합 네비게이션 솔루션입니다.
  </p>
<img src="https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/pnpm-22C55E?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
   <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android" />
  <img src="https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=apple&logoColor=white" alt="iOS" />
</div>

<br/>

### 📱 Preview

| 대여소 지도 | 경로 안내 | 네비게이션 | 마이페이지 |
| :---: | :---: | :---: | :---: |
| <img width="250" alt="image" src="https://github.com/user-attachments/assets/3365f08b-4d84-4fc2-8f90-8f74ffc7721b" /> | <img width="250" alt="image" src="https://github.com/user-attachments/assets/3c8b80ef-b89a-473a-bf84-c12fb129ba16" /> | <img width="250" alt="image" src="https://github.com/user-attachments/assets/03009264-0e76-4cef-88ba-0413274892f0" /> |  <img width="250" alt="image" src="https://github.com/user-attachments/assets/3290fe53-3652-456e-8ce5-2cb6acb701e1" /> |
<br/>

## ✨ 주요 기능
| 기능 | 설명 |
| :--- | :--- |
| **🗺️ 대여소 지도** | 현재 위치 기반 따릉이 대여소 조회, 잔여 자전거 실시간 확인 |
| **📍 경로 안내** | 도보와 자전거가 결합된 최적 경로 추천 및 음성 안내(TTS) |
| **🔍 검색 자동완성** | Kakao Local API 기반의 빠르고 정확한 장소/주소 검색 |
| **⭐ 즐겨찾기** | 자주 가는 장소를 저장하고 관리 |
| **👤 마이페이지** | 라이딩 기록 확인 및 앱 설정 관리 |
| **🚀 온보딩** | 최초 실행 시 권한 허용 및 앱 사용 가이드 제공 |
<br/>

## 🛠 기술 스택
| 분류 | 기술 |
| :--- | :--- |
| **Core** | React Native 0.81, React 19, TypeScript |
| **State** | Zustand, @tanstack/react-query |
| **Navigation** | React Navigation (Stack, Bottom-tabs) |
| **Styling** | tailwind-rn, Custom JSON System |
| **Map & Location** | Kakao Local REST API |
| **Multimedia** | react-native-track-player (TTS) |
| **Utils** | react-native-permissions, AsyncStorage, Bottom Sheet |

<br/>

## ⚙️ Requirements
* **macOS** (iOS 빌드 시 필수)
* **Xcode 15+**
* **Node.js** >= 18
* **pnpm** (Package Manager)
* **CocoaPods**

<br/>

## 📂 프로젝트 구조
```
src/
├── 📁 app/           # App 엔트리, 네비게이터 초기 라우트
├── 📁 assets/        # 로컬 이미지, 아이콘, 폰트 리소스
├── 📁 config/        # Axios, Toast 등 전역 설정 파일
├── 📁 features/      # 도메인별 기능 모듈 (map, route, search, auth 등)
├── 📁 screens/       # 페이지 단위 컴포넌트
└── 📁 shared/        # 공통 UI 컴포넌트, 유틸리티 함수, 상수
```

## 🚀 Getting Started

### 1. 저장소 클론 및 설치
이 프로젝트는 패키지 매니저로 **pnpm**을 사용합니다.

```bash
git clone <repository-url>
cd ddareungi-map-fe

# 의존성 설치
pnpm install
```

### 2. 환경 변수 설정 (.env)
프로젝트 루트에 .env 파일을 생성하고 필요한 키 값을 입력하세요.
```bash
KAKAO_REST_API_KEY=카카오RESTAPI키
```

### 3. iOS 실행 (macOS)
iOS 시뮬레이터를 실행하기 전에 Pod을 설치해야 합니다.
```bash
cd ios
pod install
cd ..

# Metro 실행
pnpm metro

# 별도 터미널에서 실행
pnpm ios
```

### 4. Android 실행
```bash
pnpm android
```

## 🔐 iOS Signing 설정 (실기기 테스트)
1.	```ios/*.xcworkspace``` 파일을 Xcode로 엽니다.
2.	**Target** → **Signing & Capabilities** 탭 클릭
3.	**Team**을 본인의 Apple ID (Personal Team)로 설정
4.	Automatically manage signing 체크
5.	**Bundle Identifier**가 중복될 경우 고유한 값으로 변경
6.	아이폰 연결 후 빌드 (```Cmd + R```)

     *Note: 최초 실행 시 아이폰의 ```설정 > 일반 > VPN 및 기기 관리```에서 개발자 앱 신뢰 버튼을 눌러야 합니다.*

## 💥 Troubleshooting (문제 해결)
자주 발생하는 이슈와 해결 방법입니다.

### Pod 설치 오류 / 버전 불일치
iOS 의존성 설치가 꼬였을 때 아래 명령어로 초기화하세요.
```bash
cd ios
pod deintegrate
rm Podfile.lock
pod install --repo-update
cd ..
```

### Metro 캐시 문제 (흰 화면/모듈 못 찾음)
```
# 캐시를 포함하여 시작
pnpm start --reset-cache
```

### iOS 빌드 실패 (PhaseScriptExecution 등)
Xcode DerivedData 문제일 가능성이 큽니다.
```
# 파생 데이터 삭제
rm -rf ~/Library/Developer/Xcode/DerivedData
```
