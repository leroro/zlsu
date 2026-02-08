# 프로젝트 컨텍스트

## ⚠️ 단일 진실 공급원 (SSOT) 원칙

**시스템의 모든 정보는 실제 구현된 소스 코드가 기준입니다.**

### 1. InfoPage (가입 전 비회원용)
- **파일**: `src/components/about/AboutContent.tsx`
- **내용**: 모임 소개, 활동 안내, 가입 방법, 수모 안내 등
- **역할**: 신규 가입 희망자를 위한 공식 안내

### 2. 회칙 (가입 후 회원용)
- **파일**: `public/rules/v2.0.md` (최신 버전)
- **내용**: 운영 규정, 회비, 시간 준수, 벌금, 정원, 회원 레벨 등
- **역할**: 회원용 공식 운영 규정

### 적용 규칙
- ✅ 모임 정보 변경 시 위 두 파일 먼저 수정
- ✅ docs 폴더 문서는 참고용/아카이브일 뿐
- ✅ 불일치 발견 시 소스 코드가 우선
- ✅ 새 문서 작성 시에도 위 두 파일 기준으로 작성

---

## 세션 종료 규칙

**사용자가 "세션 종료", "세션 끝", "끝낼게요" 등 세션 종료 의사를 밝히면 반드시 `/end-session` 스킬을 자동 실행한다.**

- 사용자가 별도로 요청하지 않아도 자동 실행
- 작업 내역 문서화 → 빌드 → 커밋/푸시 순서로 진행

---

## 커밋 컨벤션

커밋 메시지 작성 시 반드시 이슈 번호를 포함해야 합니다.

- 형식: `<type>: <description> #<이슈번호>`
- 예시: `feat: 이벤트 안내 섹션 추가 #1`

## 커밋 정책

**커밋은 바로바로 하지 않습니다.**

1. 작업 완료 시 `npm run build`로 빌드 오류 확인까지만 수행
2. 커밋은 다음 상황에서만 진행:
   - 사용자가 "됐다" 또는 작업 완료를 명시할 때
   - 사용자가 전혀 다른 업무를 요청할 때 → "기존 작업 커밋하고 다음 작업으로 진행할까요?" 확인
3. 자잘한 수정사항마다 커밋하지 않고, 작업 단위가 마무리되면 한 번에 커밋

## 작업 완료 시 필수 안내

**화면/데이터 수정 완료 후 반드시 다음을 안내한다:**

1. **PR 생성 URL**: `https://github.com/leroro/zlsu/pull/new/{브랜치명}`
2. **GitHub Pages 확인 URL**: `https://leroro.github.io/zlsu/`

**회원 데이터(mockData.ts) 변경 시:**
- `src/lib/api.ts`의 `DATA_VERSION` 반드시 +1 증가
- 버전 미업데이트 시 브라우저 localStorage가 초기화되지 않아 변경사항 미반영

## 배포 정책

**두 개의 저장소가 있으며, 용도에 따라 구분하여 배포한다.**

| 저장소 | 용도 | 스킬 | URL |
|--------|------|------|-----|
| PMS (`origin`) | 개발/테스트 | `/deploy-pms` | 내부용 |
| GitHub (`github`) | 회원 공개 | `/deploy-github` | https://leroro.github.io/zlsu/ |

**사용자 요청 키워드:**
- "PMS에 올려" → `/deploy-pms` 실행
- "깃헙에 올려" → `/deploy-github` 실행

**기술 참고:**
- HashRouter 사용으로 `base: './'` (상대경로)가 모든 환경에서 동작
- vite.config.ts 수정 불필요
- GitHub 배포 시 `SHOW_DEV_LOGIN = false` 필수

## master 병합 정책

**master 브랜치 푸시 권한이 없을 때:**

1. feature 브랜치(`claude/xxx`)에 모든 변경사항 푸시
2. 사용자에게 PR 생성 URL 제공
3. 사용자가 직접 병합

```
PR 생성 URL 형식:
https://github.com/leroro/zlsu/pull/new/{브랜치명}
```

---

## 현재 작업 중인 이슈

작업 전 `docs/` 폴더의 최신 날짜 폴더에서 개발 요구사항을 확인하세요.

| 이슈 번호 | 제목 | 상태 |
|-----------|------|------|
| #1 | 모임 소개 화면에 이벤트 및 대외 활동 안내 콘텐츠 추가 | 진행 중 |

## 이슈 관리 규칙

1. 새 이슈 시작 시 이 파일의 "현재 작업 중인 이슈" 테이블 업데이트
2. 커밋 시 해당 이슈 번호 포함 필수
3. 이슈 완료 시 상태를 "완료"로 변경

---

## 시스템 현황 (2026-01-22 기준)

### 이중 승인 시스템 (완료)

회원 가입 시 추천인 동의 → 관리자 승인의 2단계 프로세스 구현 완료

**플로우:**
1. 신청자가 가입 신청 (추천인 지정 필수)
2. 추천인이 동의 (3가지 체크박스 모두 체크 필수)
   - 적합성 추천
   - 멘토링 약속
   - 수모 전달 약속 (수모 담당자에게 수령하여 신규 회원에게 전달)
3. 관리자가 가입비 납부 확인 후 최종 승인
4. 회원 상태 `active`로 변경

**관련 타입 (`src/lib/types.ts`):**
```typescript
interface ReferrerApproval {
  status: ApprovalStepStatus;
  processedAt?: string;
  agreedToSuitability?: boolean;
  agreedToMentoring?: boolean;
  agreedToProvideCap?: boolean;  // 수모 전달 약속
  rejectReason?: string;
}

interface AdminApproval {
  status: ApprovalStepStatus;
  processedAt?: string;
  processedBy?: string;
  rejectReason?: string;
}
```

**관련 API 함수 (`src/lib/api.ts`):**
- `getPendingMembersForReferrer(referrerName)` - 추천인의 동의 대기 목록
- `referrerApproveMember(memberId, ...)` - 추천인 동의
- `referrerRejectMember(memberId, rejectReason)` - 추천인 반려
- `getMembersAwaitingAdminApproval()` - 관리자 승인 대기 목록
- `adminApprovePendingMember(memberId, processedBy)` - 관리자 승인
- `adminRejectPendingMember(memberId, processedBy, rejectReason)` - 관리자 반려

**관련 페이지:**
- `src/pages/ReferrerApprovalPage.tsx` - 추천인 동의 페이지
- `src/pages/HomePage.tsx` - 추천인용 "할 일" 섹션, 신청자용 진행 상태
- `src/pages/admin/RequestsPage.tsx` - 관리자 승인 페이지

### 데이터 버전 시스템

localStorage 데이터 자동 리셋을 위한 버전 관리 (`src/lib/api.ts`):
```typescript
const DATA_VERSION = 2;
```
버전 변경 시 사용자의 localStorage가 자동으로 초기화됨

### 개발용 빠른 로그인

`src/pages/LoginPage.tsx`에 테스트 계정 버튼 구현:
- `SHOW_DEV_LOGIN = true` 로 활성화/비활성화
- 배포 시 `false`로 변경 필요

**테스트 계정:**
- 관리자: admin / zlsu2024!
- 추천인 역할: hansunwoo@test.com, leroro@inseq.co.kr
- 신청자 역할: pending@test.com 등

---

## 다음 작업 (우선순위순)

### 1. 신규 회원 환영 메시지 기능 (미구현)

**요구사항:**
- 가입 승인 완료 후 첫 로그인 시 환영 메시지 표시
- "가입을 환영합니다! 카카오 단톡방 버튼을 클릭해서 입장해 주세요"
- 버튼 클릭 후에는 메시지 숨김

**구현 방법:**
1. `Member` 인터페이스에 `hasJoinedKakao?: boolean` 필드 추가
2. HomePage에 환영 메시지 컴포넌트 추가 (할 일 섹션보다 위)
3. 버튼 클릭 시 `hasJoinedKakao = true`로 업데이트
4. `true`인 경우 환영 메시지 숨김

**상세 명세:** `docs/2026-01-22/08_다음_개발_작업.md` 참조

---

## 스탭 정보

| 역할 | 담당자 | 시스템 내 역할 |
|------|--------|---------------|
| 총무 | 임미선 | 관리자 (가입 승인, 회비 관리) |
| 수모 담당 | 최선숙 | 일반 회원 (수모 보관/지급) |
| 지도 | 한선우 코치님 | 일반 회원 (수영 지도) |

---

## 주요 파일 구조

```
src/
├── lib/
│   ├── types.ts      # 타입 정의 (Member, ReferrerApproval 등)
│   ├── api.ts        # API 함수 (localStorage 기반)
│   ├── mockData.ts   # 테스트용 초기 데이터
│   └── constants.ts  # 상수 (수영 레벨 등)
├── pages/
│   ├── HomePage.tsx           # 메인 대시보드
│   ├── LoginPage.tsx          # 로그인 (개발용 빠른 로그인 포함)
│   ├── ApplyPage.tsx          # 가입 신청
│   ├── ReferrerApprovalPage.tsx  # 추천인 동의 페이지
│   └── admin/
│       └── RequestsPage.tsx   # 관리자 가입 승인
├── contexts/
│   └── AuthContext.tsx        # 인증 컨텍스트
└── routes.tsx                 # 라우팅 설정
```

---

## UI 일관성 원칙 (필수 준수)

**기존 UI 톤앤매너를 절대 해치지 않는다.**

1. **기존 화면 참고 필수**: 새 화면을 만들거나 수정할 때 반드시 유사한 기존 화면의 스타일을 참고
2. **과도한 간소화 금지**: "간소화" 요청 시에도 기존 레이아웃 구조는 유지하고 중복 내용만 제거
3. **컴포넌트 재사용**: 박스, 카드, 알림 등 기존에 사용된 스타일 패턴 그대로 사용
4. **폰트 크기/여백 유지**: 임의로 크기나 간격을 변경하지 않음
5. **인라인 스타일 지양**: 가로 나열 등 급조한 레이아웃 사용 금지

**"간소화" 요청 시 주의:**
- 중복되는 내용만 제거, 유용한 정보는 절대 삭제 금지
- 레이아웃 구조(박스, 카드 등)는 유지
- 확대해석 금지: "복잡하다" ≠ "다 지워라"

**변경 전 체크리스트:**
- [ ] 유사한 기존 화면이 있는가? → 있으면 해당 스타일 따르기
- [ ] 기존 구조를 깨뜨리는 변경인가? → 최소한의 변경으로 목적 달성
- [ ] 새로운 스타일 패턴을 도입하는가? → 사용자 확인 필요
- [ ] 정보를 삭제하는가? → 중복 여부 재확인, 유용한 정보면 유지

---

## UI/CSS 패턴 (필수 준수)

### 이미지 경로 (필수)

public 폴더의 이미지를 사용할 때는 반드시 `asset()` 함수를 사용합니다:

```tsx
import { asset } from '../lib/assets';

// ✅ 올바른 패턴
<img src={asset('images/logo.svg')} />

// ❌ 잘못된 패턴 (로컬에서 깨짐)
<img src="./images/logo.svg" />
<img src="/images/logo.svg" />
```

**이유:** 개발 서버와 빌드 환경의 base URL이 다르기 때문

---

### 입력창 + 버튼 가로 배치 패턴

입력창과 버튼을 `flex`로 가로 배치할 때 **모바일에서 overflow 발생 방지** 필수:

```tsx
// ✅ 올바른 패턴
<div className="flex gap-2">
  <input className="flex-1 min-w-0 ..." />  {/* min-w-0 필수! */}
  <Button className="whitespace-nowrap">확인</Button>
</div>

// ❌ 잘못된 패턴 (overflow 발생)
<div className="flex gap-2">
  <input className="flex-1 ..." />  {/* min-w-0 없음 → 기본 min-width로 인해 버튼이 밀려남 */}
  <Button className="shrink-0">확인</Button>  {/* shrink-0 → 버튼이 축소 안됨 */}
</div>
```

**핵심 규칙:**
1. `flex-1` 입력창에는 반드시 `min-w-0` 추가 (flexbox 기본 min-width 오버라이드)
2. 버튼에 `shrink-0` 사용 금지 (컨테이너가 좁으면 overflow 발생)
3. 버튼 텍스트 줄바꿈 방지는 `whitespace-nowrap`만 사용
4. `overflow-hidden`은 포커스 링을 잘라버리므로 사용 금지

### iOS Safari 스크롤 이슈

페이지 이동 시 스크롤이 맨 위로 안 올라가는 문제:
- 원인: 모바일 브라우저 주소창 높이 변화
- 해결: `ScrollToTop.tsx`에서 다중 타이머 + `visualViewport` API 사용

---

## 빌드 및 테스트

```bash
npm run build    # 타입 체크 + 빌드
npm run dev      # 개발 서버 실행
```

빌드 시 unused imports/variables 에러가 자주 발생하므로 코드 수정 후 반드시 빌드 확인
