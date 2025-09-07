# Contributing Guidelines (Frontend)

이 문서는 프론트엔드 레포(`ddareungi-map-fe`) 기여자를 위한 협업 규칙을 정의합니다.  
코드를 작성하거나, 이슈/PR을 등록하기 전에 반드시 확인해주세요.

---

## 🪵 브랜치 전략

- `main` : 배포용 안정 브랜치
- `dev` : 개발 통합 브랜치
- `feat/*` : 기능 개발
- `fix/*` : 버그 수정
- `refactor/*` : 리팩토링
- `docs/*` : 문서 작업
- `test/*` : 테스트 코드
- `chore/*` : 빌드, 설정, 배포 등 잡무
- `style/*` : 코드 스타일 수정
- `hotfix/*` : 운영 중 긴급 수정

---

## 🗒️ 이슈 관리

### 이슈 타입
- **Feature** : 새로운 기능 개발
- **Bug** : 버그 수정
- **Docs** : 문서 관련 작업
- **Design** : UI/UX 관련 작업
- **Task** : 일반 작업 (리팩토링, 테스트, 설정 등)

### 이슈 제목
- **브랜치 타입**을 기반으로 작성합니다.
  
```
[브랜치 타입] 이슈 제목
예시: [feat] 카카오 로그인 구현
```

### 이슈 본문

  ```
  ## 📄 작업 대상
   - 
  
  ## ✅ 작업 내용
    - [x] To do
    - [ ] To do
  
  ## 💬 리뷰 요구사항
  
  ## 📎 기타 참고 사항
    - 관련 API 문서: [링크]
  
  ```

### 라벨 (페이지 단위)
- `page: intro` → 랜딩/온보딩
- `page: auth` → 로그인/회원가입
- `page: main` → 홈(지도)
- `page: search` → 검색/장소 선택
- `page: route` → 경로 선택/상세
- `page: navigation` → 네비게이션
- `page: station` → 대여소 정보
- `page: mypage` → 마이페이지/설정

---

## 💻 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 스타일을 따릅니다.  
커밋 메시지는 반드시 소문자로 시작하고, 짧고 명확하게 작성합니다.

### 커밋 타입
- `feat:` 새로운 기능 추가
- `fix:` 버그 수정
- `refactor:` 코드 리팩토링
- `style:` 코드 스타일 수정
- `docs:` 문서 작업
- `test:` 테스트 코드 추가/수정
- `release:` 릴리즈 작업
- `chore:` 설정/빌드/배포
- `init:` 초기 세팅
- `mod:` 기존 기능/코드 일부 수정
- `merge:` 브랜치 병합

### 예시
```
feat: 자체 로그인 폼 검증 추가
fix: 경로 상세조회 null 에러 수정
docs: README 실행 방법 보완
```

---

## 🤝 Pull Request(PR) 규칙
### PR 제목
  
  ```
  [브랜치 타입] 작업 내용 (#이슈번호)
  예시: [feat] 회원가입 API 연동 (#15)
  ```

### PR 본문

  ```
  ## 📌 개요
  - 
  
  ## 🗒️ 작업 내용 요약
  - 
  
  ## 🔗 관련 이슈
  - Closes #이슈번호
  ```

---

## ✅ 요약
- 브랜치 = `feat/*`, `fix/*`, `docs/*` 등 목적에 맞게 생성  
- 이슈 = 타입(Feature, Bug 등) + 제목 규칙 준수 + 페이지 라벨 지정  
- 커밋 = `feat: ~`, `fix: ~` 등 컨벤션 통일  
- PR = 제목/본문/리뷰 규칙 준수
