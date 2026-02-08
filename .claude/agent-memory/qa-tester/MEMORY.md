# QA Tester 에이전트 메모리

## 빈번한 빌드 실패 원인 (우선순위순)

1. **unused import/variable** → TypeScript 빌드 에러 (가장 빈번)
2. **타입 불일치** → 새 필드 추가 시 optional 빠뜨림
3. **asset() 미사용** → 배포 후 이미지 깨짐 (빌드는 통과하지만 런타임 오류)

## 핵심 검증 시나리오

### 이중 승인 플로우
```
Given: 신규 가입 신청
When: 추천인 동의 (3체크 모두) → 관리자 승인
Then: 회원 상태 active, 로그인 가능
```
- 엣지: 추천인 체크 1~2개만 체크, 추천인 반려 후 재신청, 관리자 반려

### 회원 상태 전이
```
active ↔ inactive: 정상 전환
active → withdrawn: 탈퇴
pending에서 직접 active: 불가 (승인 필수)
```

### 역할별 접근
- admin: 모든 관리 페이지 접근 가능
- member: 본인 정보만, 추천인이면 동의 페이지 접근
- 비회원: 소개/가입 신청만

## 데이터 일관성 체크 포인트

- mockData.ts의 회원 ↔ types.ts 인터페이스 일치
- referrerApproval/adminApproval 상태 ↔ 회원 status 일관성
- DATA_VERSION 변경 여부 (mockData 수정 시)

## 빌드 명령
```bash
npm run build    # TypeScript + Vite, 실패 시 에러 메시지 그대로 보고
```

## 피드백 이력

(세션에서 피드백을 받을 때마다 여기에 추가)
