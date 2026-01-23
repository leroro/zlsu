# Deploy GitHub - 공개용 GitHub Pages 배포

**공개용** GitHub Pages에 사이트를 배포합니다. (회원 접속용)

## 저장소 정보

- Remote: `github`
- URL: https://github.com/leroro/zlsu
- 배포 URL: https://leroro.github.io/zlsu/
- 용도: 회원 공개 배포

## 작업 순서

1. **개발용 로그인 비활성화 확인**
   - `src/components/common/DevQuickLogin.tsx`에서 `SHOW_DEV_LOGIN = false` 확인
   - `true`면 `false`로 변경

2. **빌드 테스트**
   - `npm run build` 실행
   - 오류 시 수정

3. **커밋**
   - 변경사항이 있으면 커밋

4. **GitHub에 푸시**
   ```bash
   git push https://leroro:$GITHUB_TOKEN@github.com/leroro/zlsu.git master
   ```
   - 토큰이 필요하면 사용자에게 요청

5. **배포 확인**
   - GitHub Actions 상태 확인
   - 완료 후 URL 안내: https://leroro.github.io/zlsu/

## 주의사항

- 반드시 `SHOW_DEV_LOGIN = false` 확인 (테스트 계정 노출 방지)
- `base: './'` 설정 유지 (vite.config.ts 수정 불필요)
- master 브랜치에서 푸시해야 GitHub Actions 트리거됨
