# Deploy PMS - 개발용 저장소 배포

**개발용** PMS 저장소에 배포합니다. (내부 개발/테스트용)

## 저장소 정보

- Remote: `origin`
- URL: http://pms.inseq.co.kr/leroro/zlsu
- 용도: 개발, 테스트, 백업

## 작업 순서

1. `npm run build` 실행 (빌드 오류 시 수정)
2. 변경사항 커밋
3. `git push origin develop` 또는 `git push origin master`

## 참고

- 개발용이므로 `SHOW_DEV_LOGIN = true` 유지 가능
- 공개 배포는 `/deploy-github` 사용
