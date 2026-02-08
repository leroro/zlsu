# UI Developer 에이전트 메모리

## ZLSU UI 패턴 가이드

### 필수 CSS 규칙 (빌드/배포 직결)

1. **이미지 경로**: 반드시 `asset()` 함수 사용
   ```tsx
   import { asset } from '../lib/assets';
   <img src={asset('images/logo.svg')} />
   ```

2. **flex 입력창+버튼**: `min-w-0` 필수, `shrink-0` 금지
   ```tsx
   <input className="flex-1 min-w-0 ..." />
   <Button className="whitespace-nowrap">확인</Button>
   ```

3. **overflow-hidden 금지**: 포커스 링이 잘림

### 컴포넌트 참조 패턴

| 화면 유형 | 참조할 기존 화면 |
|----------|----------------|
| 카드/박스 레이아웃 | HomePage.tsx (할 일 섹션) |
| 폼 입력 | ApplyPage.tsx (4단계 스텝 폼) |
| 목록 | admin/RequestsPage.tsx (승인 대기 목록) |
| 안내 페이지 | AboutContent.tsx (섹션별 구성) |
| 상태 뱃지 | StatusBadge.tsx 재사용 |

### 정보 밀도 기준 (프로젝트 오너 핵심 원칙)

- **반복 조회 화면** (대시보드, 목록): 컴팩트하게, 한눈에 스캔 가능
- **최초 인지 화면** (가입, 온보딩): 단계적 노출, 한 화면에 한 개념

### 모바일 우선 체크

- iOS Safari 스크롤 이슈 → ScrollToTop.tsx 참고
- 터치 영역 최소 44px
- 버튼 텍스트 `whitespace-nowrap`으로 줄바꿈 방지

## 피드백 이력

(세션에서 피드백을 받을 때마다 여기에 추가)
