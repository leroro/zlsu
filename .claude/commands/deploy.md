# Deploy - 빌드 후 커밋/푸시

프로젝트를 빌드하고 Git에 커밋/푸시하는 작업을 수행합니다.

## 작업 순서

1. `npm run build` 실행
2. 빌드 오류 시 TypeScript 오류 수정
3. `git add -A`로 모든 변경사항 스테이지
4. 사용자에게 커밋 메시지 확인 후 커밋
5. `git push origin develop` (필요시 --force)

## 주의사항

- 빌드 전 TypeScript 오류가 있으면 먼저 수정
- dist 폴더가 .gitignore에서 제외되어 있는지 확인
- 커밋 메시지는 conventional commits 형식 사용
