# Commit - 이슈 번호 포함 커밋

변경사항을 커밋합니다. 이슈 트래커와 연동을 위해 이슈 번호를 포함합니다.

## 작업 순서

1. `CLAUDE.md` 파일에서 현재 작업 중인 이슈 번호 확인
2. `git status`로 변경된 파일 확인
3. `git diff`로 변경 내용 파악
4. 변경 내용을 바탕으로 커밋 메시지 초안 작성
5. 사용자에게 커밋 메시지 확인 요청
6. `git add` 및 `git commit` 실행

## 커밋 메시지 형식

```
<type>: <description> #<이슈번호>

[선택적 본문]

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Type 종류
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 리팩토링
- `chore`: 빌드, 설정 변경

## 예시

```
feat: 이벤트 안내 섹션 추가 #1

모임 소개 화면에 연말 행사, 대회 참여 안내 콘텐츠 추가

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## 주의사항

- 이슈 번호가 없으면 사용자에게 확인 요청
- CLAUDE.md에 이슈 정보가 없으면 docs 폴더의 요구사항 파일 확인
