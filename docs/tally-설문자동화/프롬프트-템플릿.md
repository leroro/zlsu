# Tally 설문 자동 생성 프롬프트 템플릿

> 이 프롬프트를 Claude에게 주고, 하단의 `[설문 내용]`만 채우면 즉시 Tally 설문이 생성됩니다.

---

## 프롬프트 (복사해서 사용)

```
너는 Tally.so API 전문가다. 아래 규칙을 절대 준수하고, [설문 내용]으로 Tally 폼을 즉시 생성하라.

## Tally API 규칙 (실전 검증 완료)

### 엔드포인트
- POST https://api.tally.so/forms
- Authorization: Bearer {TALLY_API_KEY}
- Content-Type: application/json

### 블록 구조 (반드시 준수)
모든 블록은 5개 필드 필수: uuid, type, groupUuid, groupType, payload

1. **단독 블록** (FORM_TITLE, TEXT, HEADING_2, DIVIDER, THANK_YOU_PAGE)
   - groupUuid === uuid (자기 자신)
   - groupType === type (자기 타입)

2. **질문 블록** (TITLE + 입력 블록)
   - TITLE 블록: groupUuid → 입력 블록의 uuid 참조, groupType: "TITLE"
   - 입력 블록: groupUuid === uuid, groupType === type

3. **객관식** (TITLE + MULTIPLE_CHOICE_OPTION들)
   - 명시적 MULTIPLE_CHOICE 부모 블록 만들지 않는다
   - TITLE: groupUuid → 옵션들의 공유 groupUuid와 동일, groupType: "TITLE"
   - 옵션: type "MULTIPLE_CHOICE_OPTION", groupType: "MULTIPLE_CHOICE"
   - payload: { "index": 0부터, "text": "옵션 라벨", "isFirst": true/false, "isLast": true/false }
   - 모든 옵션이 동일 groupUuid 공유
   - 기본: 단일 선택 (복수 선택은 CHECKBOXES)

### 금지 사항 (400 에러 원인)
- ❌ groupType에 "QUESTION" 사용 금지 → 해당 블록의 type을 사용
- ❌ LINEAR_SCALE payload에 minValue/maxValue/minLabel/maxLabel 금지 (tally-js 타입이 잘못됨)
- ❌ MULTIPLE_CHOICE_OPTION의 payload에 html 필드 금지 → text 사용
- ❌ MULTIPLE_CHOICE_OPTION에 index를 payload 바깥에 두지 말 것
- ❌ MULTIPLE_CHOICE_OPTION에서 isFirst/isLast 누락 금지

### LINEAR_SCALE (척도) 올바른 필드명
tally-js 라이브러리의 타입 정의가 잘못되어 있으므로, 아래 올바른 필드명을 사용:
- `start`: 시작값 (예: 1)
- `end`: 끝값 (예: 10)
- `step`: 간격 (예: 1)
- `hasLeftLabel`: boolean (true)
- `leftLabel`: 왼쪽 끝 라벨 (예: "전혀 아니다")
- `hasRightLabel`: boolean (true)
- `rightLabel`: 오른쪽 끝 라벨 (예: "매우 그렇다")
- `isRequired`: boolean

### RATING (별점) 올바른 필드명
- `stars`: 별 개수 (예: 5)
- ❌ maxValue 사용 금지

### 검증된 payload 패턴
| 블록 타입 | groupType | payload |
|-----------|-----------|---------|
| FORM_TITLE | FORM_TITLE | { "html": "제목" } |
| TEXT | TEXT | { "html": "설명 텍스트" } |
| HEADING_2 | HEADING_2 | { "html": "섹션 제목" } |
| DIVIDER | DIVIDER | {} |
| TITLE | TITLE | { "html": "질문 텍스트" } |
| LINEAR_SCALE | LINEAR_SCALE | { "isRequired": true, "start": 1, "end": 10, "step": 1, "hasLeftLabel": true, "leftLabel": "전혀 아니다", "hasRightLabel": true, "rightLabel": "매우 그렇다" } |
| RATING | RATING | { "isRequired": true, "stars": 5 } |
| TEXTAREA | TEXTAREA | { "isRequired": false } |
| MULTIPLE_CHOICE_OPTION | MULTIPLE_CHOICE | { "index": 0, "text": "옵션", "isFirst": true, "isLast": false } |
| THANK_YOU_PAGE | THANK_YOU_PAGE | { "html": "감사 메시지" } |

## 실행 절차

1. [설문 내용]을 파싱하여 블록 배열 구성
2. Node.js로 JSON 파일 생성 (UUID는 crypto.randomUUID() 사용)
3. curl로 POST https://api.tally.so/forms 호출 (Node.js fetch는 DNS 문제 가능)
4. 응답의 id로 폼 URL 출력: https://tally.so/r/{id}
5. 편집 URL도 함께 출력: https://tally.so/forms/{id}/edit

## TALLY_API_KEY
{여기에 API 키 입력 또는 환경변수 사용}

---

[설문 내용]

설문 제목: (여기에 입력)
상태: PUBLISHED 또는 DRAFT
익명 여부: (예/아니오)

문항:
(여기에 문항 목록 입력 - 각 문항에 유형 표기)
- 척도 (1~10): LINEAR_SCALE 사용 (전혀 아니다 ~ 매우 그렇다)
- 척도 (1~5): LINEAR_SCALE 사용 (start:1, end:5)
- 서술형: TEXTAREA
- 단일 선택: MULTIPLE_CHOICE_OPTION들
- 별점: RATING (stars:5)

예시:
[섹션 1 제목]
Q1. 질문 내용 (10점 척도, 필수)
Q2. 질문 내용 (서술형, 선택)

Thank you 화면: (메시지 입력)
```

---

## 사용 예시

위 프롬프트에 아래처럼 [설문 내용]만 채워서 Claude에게 전달:

```
[설문 내용]

설문 제목: 워크숍 만족도 조사
상태: PUBLISHED
익명 여부: 예

문항:
[섹션 1 프로그램 만족도]
Q1. 워크숍 내용이 기대에 부합했다 (10점 척도, 필수)
Q2. 가장 유익했던 세션은 무엇입니까 (서술형, 선택)

[섹션 2 운영]
Q3. 시간 배분이 적절했다 (10점 척도, 필수)
Q4. 개선 의견이 있다면 자유롭게 작성해주세요 (서술형, 선택)

Thank you 화면: 소중한 의견 감사합니다!
```

---

## 핵심 포인트

이 프롬프트가 시행착오를 없애는 이유:

1. **groupType 규칙 명시** - 가장 빈번한 400 에러 원인을 사전 차단
2. **LINEAR_SCALE 올바른 필드명** - tally-js 타입 정의가 잘못됨 (start/end/step, NOT minValue/maxValue)
3. **RATING 올바른 필드명** - stars 사용 (NOT maxValue)
4. **MULTIPLE_CHOICE_OPTION 구조** - index/text/isFirst/isLast 위치, 부모 블록 불필요 등 함정 정리
5. **금지 사항 목록** - API가 거부하는 패턴을 명시적으로 차단
6. **검증된 payload 테이블** - 각 블록별 정확한 필드만 사용
7. **curl 사용 권장** - Node.js fetch DNS 문제, Python urllib Cloudflare 차단 대비
