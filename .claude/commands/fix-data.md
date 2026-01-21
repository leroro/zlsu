# Fix Data - Mock 데이터 일관성 검증 및 수정

mockData.ts의 데이터 일관성을 검증하고 수정합니다.

## 검증 항목

1. **회원 데이터 (initialMembers)**
   - 상태(active/inactive/withdrawn)와 다른 데이터 일치 여부
   - 필수 필드 누락 여부

2. **상태 변경 신청 (initialStateChanges)**
   - memberId와 실제 회원 매칭 확인
   - memberName과 실제 이름 일치 확인
   - currentStatus와 회원의 실제 status 일치 확인

3. **상태 변경 이력 (initialStatusChangeHistory)**
   - 회원 정보와 일치 여부

## 수정 원칙

- 회원 데이터는 실제 정보 기준이므로 수정하지 않음
- 신청/이력 데이터를 회원 데이터에 맞게 수정
