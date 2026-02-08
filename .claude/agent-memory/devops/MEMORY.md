# DevOps 에이전트 메모리

## 배포 환경 요약

| 대상 | 리모트 | 브랜치 | SHOW_DEV_LOGIN | 용도 |
|------|--------|--------|----------------|------|
| PMS | `origin` | develop/master | true 가능 | 개발/테스트 |
| GitHub | `github` | master | **false 필수** | 회원 공개 |

## 세션 종료 체크리스트 (절대 순서 변경 금지)

1. DATA_VERSION 확인 (mockData 변경했으면 +1)
2. 소스 파일 커밋/푸시
3. `npm run build`
4. **dist/ 커밋/푸시** (빌드 산출물)
5. `git status` 최종 확인 (settings.local.json 제외 미커밋 파일 없어야 함)

## 커밋 컨벤션
```
<type>: <description> #<이슈번호>
```
타입: feat, fix, docs, refactor, chore

## 자주 발생하는 배포 실수

1. **dist/ 미커밋**: 소스만 푸시하고 빌드 산출물 빠뜨림 → GitHub Pages에 반영 안됨
2. **SHOW_DEV_LOGIN = true로 GitHub 배포**: 테스트 계정이 공개됨
3. **DATA_VERSION 미증가**: mockData 변경했는데 버전 안 올림 → 기존 사용자 브라우저 반영 안됨
4. **브랜치 혼동**: PMS는 develop, GitHub는 master

## 피드백 이력

(세션에서 피드백을 받을 때마다 여기에 추가)
