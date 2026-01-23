# 데이터베이스 도입 (Supabase)

## 개요

localStorage 기반 목업 시스템을 실제 데이터베이스로 전환

## 현재 상태

- [ ] 미착수

## 왜 Supabase인가

| 특징 | 설명 |
|------|------|
| 무료 티어 | 충분한 용량 (500MB DB, 1GB 스토리지) |
| 인증 내장 | 카카오 로그인 등 소셜 로그인 지원 |
| 실시간 지원 | 데이터 변경 시 자동 반영 |
| 관리 UI | SQL 몰라도 데이터 확인/수정 가능 |
| 한국어 | 대시보드 한국어 지원 |

---

## 사용자 작업 (필수)

### 1단계: Supabase 가입

1. https://supabase.com 접속
2. **Start your project** 클릭
3. GitHub 계정으로 가입 (또는 이메일)

### 2단계: 프로젝트 생성

1. **New Project** 클릭
2. 프로젝트 정보 입력:
   - Name: `zlsu` (또는 원하는 이름)
   - Database Password: 강력한 비밀번호 설정 (메모해두기)
   - Region: `Northeast Asia (Seoul)` 선택
3. **Create new project** 클릭
4. 생성 완료까지 대기 (1-2분)

### 3단계: API 키 확인

1. 프로젝트 대시보드 → **Settings** → **API**
2. 다음 정보 복사해서 Claude에게 전달:
   - `Project URL`
   - `anon public` 키

### 4단계: (선택) 카카오 로그인 연동

> SNS 로그인도 함께 구현할 경우

1. **Authentication** → **Providers**
2. **Kakao** 찾아서 활성화
3. 카카오 개발자에서 받은 키 입력:
   - Client ID (REST API 키)
   - Client Secret (필요시)

---

## Claude 작업

### 기본 세팅

- [ ] Supabase 클라이언트 설치 (`@supabase/supabase-js`)
- [ ] 환경변수 설정 (`.env`)
- [ ] Supabase 클라이언트 초기화

### 데이터베이스 설계

- [ ] 테이블 생성 SQL 작성
  - `members`: 회원 정보
  - `attendance`: 출석 기록
  - `notices`: 공지사항
  - `events`: 이벤트
- [ ] RLS (Row Level Security) 정책 설정
- [ ] 초기 데이터 마이그레이션

### API 레이어 수정

- [ ] `src/lib/api.ts` 수정
  - 목업/실제 DB 전환 로직
  - 모든 CRUD 함수 Supabase 버전 추가
- [ ] 환경변수로 모드 전환 가능하게

### 인증 통합 (선택)

- [ ] Supabase Auth 연동
- [ ] 카카오 로그인 통합
- [ ] 세션 관리

---

## 테이블 설계 (초안)

### members

```sql
create table members (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  phone text,
  swimming_level text,
  join_date date,
  status text default 'pending',
  role text default 'member',
  referrer_id uuid references members(id),
  referrer_approval jsonb,
  admin_approval jsonb,
  profile_image text,
  kakao_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### attendance

```sql
create table attendance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id),
  date date not null,
  status text not null,
  created_at timestamptz default now()
);
```

### notices

```sql
create table notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  author_id uuid references members(id),
  is_pinned boolean default false,
  created_at timestamptz default now()
);
```

---

## 환경 분리 전략

### 파일 구조

```
src/lib/
├── api.ts              # 통합 API (모드에 따라 분기)
├── api.mock.ts         # 목업 API (현재 코드)
├── api.supabase.ts     # Supabase API (신규)
└── supabase.ts         # Supabase 클라이언트
```

### 환경변수

```env
# .env.development (개발/테스트)
VITE_USE_MOCK_DATA=true

# .env.production (실서비스)
VITE_USE_MOCK_DATA=false
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

### 전환 로직

```typescript
// src/lib/api.ts
import * as mockApi from './api.mock';
import * as supabaseApi from './api.supabase';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const getMembers = useMock
  ? mockApi.getMembers
  : supabaseApi.getMembers;

// ... 나머지 함수들
```

**결과:**
- 개발할 때는 목업 데이터로 편하게 테스트
- 배포할 때는 실제 DB 사용
- 코드 변경 없이 환경변수만 바꾸면 됨

---

## 마이그레이션 계획

1. **테이블 생성**: Supabase에 테이블 구조 생성
2. **초기 데이터**: 기존 mockData를 Supabase에 입력
3. **API 이중화**: mock/supabase 둘 다 지원하도록 수정
4. **테스트**: 실제 DB로 전체 기능 테스트
5. **전환**: 환경변수 변경으로 실서비스 적용

---

## 체크리스트 (착수 전 확인)

- [ ] Supabase 가입 완료
- [ ] 프로젝트 생성 완료
- [ ] Project URL 확보
- [ ] anon public 키 확보
- [ ] (선택) 카카오 로그인도 함께 할지 결정

---

## 관련 이슈

- `issue-sns-login`: 카카오 로그인 (이 이슈 완료 후 방식 B로 쉽게 구현 가능)

---

## FAQ

### Q: 목업 데이터는 어떻게 되나요?
A: 그대로 유지됩니다. 환경변수로 언제든 목업 모드로 전환 가능.

### Q: 기존 테스트 계정은요?
A: Supabase에 동일하게 생성해드립니다. 로그인 방식도 동일.

### Q: 비용이 발생하나요?
A: 무료 티어로 충분합니다. 월 500MB DB, 50,000 인증 요청까지 무료.

### Q: SQL을 알아야 하나요?
A: 아니요. Supabase 대시보드에서 UI로 데이터 확인/수정 가능.
