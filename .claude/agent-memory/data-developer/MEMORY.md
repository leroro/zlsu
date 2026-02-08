# Data Developer 에이전트 메모리

## ZLSU 데이터 아키텍처

### 핵심 파일과 역할
```
src/lib/types.ts     → 모든 인터페이스/타입 (단일 진실 공급원)
src/lib/api.ts       → CRUD 함수 + DATA_VERSION (localStorage 기반)
src/lib/mockData.ts  → 초기 데이터 (DATA_VERSION으로 리셋 제어)
src/lib/constants.ts → 상수, 라벨, 설명 텍스트
```

### DATA_VERSION 규칙 (가장 중요)
```
mockData.ts 변경 → DATA_VERSION +1 필수
미증가 시 → 사용자 브라우저에서 변경사항 미반영 (localStorage가 갱신 안됨)
```
- 현재 버전: `const DATA_VERSION = 2;` (api.ts)

### 타입 설계 패턴

1. **새 필드는 항상 optional (`?`)**: 기존 localStorage 데이터와 호환
2. **`any` 절대 금지**: 명시적 타입만
3. **중앙 관리**: 타입은 types.ts에서만 정의, 다른 파일에서 import

### 회원 상태 머신
```
pending → active ↔ inactive → withdrawn
         ↑
  이중 승인 완료 후
```

### 이중 승인 데이터 구조
```typescript
Member {
  referrerApproval: { status, agreedToSuitability, agreedToMentoring, agreedToProvideCap }
  adminApproval: { status, processedBy }
}
```

### localStorage 패턴
- 동기식 CRUD (비동기 불필요)
- 초기화: mockData → localStorage 복사 (앱 시작 시, 버전 불일치 시)
- JSON.stringify/parse로 직렬화

## 피드백 이력

(세션에서 피드백을 받을 때마다 여기에 추가)
