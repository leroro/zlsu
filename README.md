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

| 구분 | 아이디/이메일 | 비밀번호 | 비고 |
|------|---------------|----------|------|
| 관리자 | admin | zlsu2024! | 시스템 관리 전용 (회원 아님) |
| 총무 | leroro@inseq.co.kr | test123 | 일반 회원 |
| 일반회원 | hansunwoo@test.com | test123 | - |

> 모든 일반회원 비밀번호는 `test123` 입니다.

## 주요 기능

- 정원 현황 표시 (관리자가 설정 가능)
- 가입 신청/승인/반려
- 회원 상태 관리 (활성/휴면/탈퇴)
- 상태 변경 신청
- 탈퇴 신청
- 회칙 조회
- 관리자 대시보드
- 시스템 설정 (정원, 정원 계산 기준)

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
- `/withdraw` - 탈퇴 신청

### 관리자
- `/admin` - 관리자 대시보드
- `/admin/applications` - 가입 신청 관리
- `/admin/members` - 회원 관리
- `/admin/members/:id` - 회원 수정
- `/admin/settings` - 시스템 설정

## 문서

자세한 문서는 `docs/` 폴더를 참고하세요:

- [01_즐수팀 운영 시스템 개발 문서.md](docs/01_즐수팀%20운영%20시스템%20개발%20문서.md) - 기획 문서
- [02_개발완료_보고서.md](docs/02_개발완료_보고서.md) - 개발 완료 보고서
- [03_사용자_가이드.md](docs/03_사용자_가이드.md) - 사용자/테스트 가이드
- [04_배포_가이드.md](docs/04_배포_가이드.md) - 배포 가이드

## 배포

GitHub Pages 자동 배포 설정됨 (main/develop 브랜치 push 시)
