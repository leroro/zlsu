# 프로젝트 컨텍스트

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

## 빌드 및 테스트

```bash
npm run build    # 타입 체크 + 빌드
npm run dev      # 개발 서버 실행
```

빌드 시 unused imports/variables 에러가 자주 발생하므로 코드 수정 후 반드시 빌드 확인
