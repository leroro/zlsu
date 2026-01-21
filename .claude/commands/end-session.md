# End Session - 세션 종료

작업 세션을 종료할 때 실행합니다. 작업 내역을 문서화하고 커밋/푸시합니다.

## 작업 순서

### 1단계: 작업 내역 확인
1. `git log --oneline -10`으로 최근 커밋 확인
2. `git status`로 미커밋 변경사항 확인
3. 현재 세션에서 수행한 작업 목록 정리

### 2단계: 문서화
1. `docs/YYYY-MM-DD/` 폴더 확인 (없으면 생성)
2. 해당 날짜 폴더의 마지막 순번 확인
3. `docs/YYYY-MM-DD/NN_세션_작업내역.md` 작성
   - 완료된 작업 목록
   - 변경된 파일 목록
   - 다음 작업 (TODO)

### 3단계: 빌드 및 배포
1. `npm run build` 실행
2. 빌드 오류 시 수정
3. `git add -A`
4. 커밋 메시지 확인 후 커밋
5. `git push origin develop`

### 4단계: 최종 확인
1. `git log --oneline -3`으로 커밋 확인
2. 푸시 완료 메시지 출력

## 커밋 메시지 형식

```
<type>: <description> (MMDD_NN)

- 주요 변경사항 1
- 주요 변경사항 2
- 작업 내역 문서화

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Type 종류
- `feat`: 새 기능
- `fix`: 버그 수정
- `chore`: 유지보수, 설정 변경
- `docs`: 문서 변경
- `refactor`: 리팩토링
- `style`: 코드 스타일 변경

## 주의사항

- 미커밋 변경사항이 있으면 반드시 포함
- 문서는 날짜 폴더에 순번으로 저장
- 빌드 실패 시 오류 수정 후 재시도
