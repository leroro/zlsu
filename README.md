# 즐수팀 운영 시스템

수영 모임 회원 관리 시스템 MVP

## 빠른 시작

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 접속: http://localhost:5173/zlsu/

### 빌드

```bash
npm run build
```

## 테스트 계정

| 구분 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@swimteam.com | admin123 |
| 일반회원 | user1@test.com | user123 |

## 주요 기능

- 정원 현황 표시 (16명 제한)
- 가입 신청/승인/반려
- 회원 상태 관리 (활동/비활동/휴식/탈퇴)
- 상태 변경 신청
- 회칙 조회 (v1.0, v2.0)
- 관리자 대시보드

## 기술 스택

- React 18 + TypeScript
- Vite
- React Router v6
- Tailwind CSS
- LocalStorage (MVP) → Supabase (예정)

## 페이지 구성

### 비로그인
- `/` - 메인 페이지
- `/rules` - 회칙
- `/apply` - 가입 신청

### 일반 회원
- `/login` - 로그인
- `/my` - 내 정보
- `/members` - 회원 목록
- `/change-status` - 상태 변경 신청

### 관리자
- `/admin` - 관리자 홈
- `/admin/applications` - 가입 신청 관리
- `/admin/members` - 회원 관리
- `/admin/members/:id` - 회원 수정

## 문서

자세한 문서는 `docs/` 폴더를 참고하세요:

- [01_즐수팀 운영 시스템 개발 문서.md](docs/01_즐수팀%20운영%20시스템%20개발%20문서.md) - 기획 문서
- [02_개발완료_보고서.md](docs/02_개발완료_보고서.md) - 개발 완료 보고서
- [03_사용자_가이드.md](docs/03_사용자_가이드.md) - 사용자/테스트 가이드
- [04_배포_가이드.md](docs/04_배포_가이드.md) - 배포 가이드

## 배포

GitHub Pages 자동 배포 설정됨 (main/develop 브랜치 push 시)
