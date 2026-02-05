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
   - payload: { "index": 0부터, "text": "옵션 라벨" }
   - 모든 옵션이 동일 groupUuid 공유

### 금지 사항 (400 에러 원인)
- ❌ groupType에 "QUESTION" 사용 금지 → 해당 블록의 type을 사용
- ❌ LINEAR_SCALE payload에 minValue/maxValue/minLabel/maxLabel 금지
- ❌ MULTIPLE_CHOICE_OPTION의 payload에 html 필드 금지 → text 사용
- ❌ MULTIPLE_CHOICE_OPTION에 index를 payload 바깥에 두지 말 것

### 5점 척도 구현 방법
LINEAR_SCALE은 라벨 설정이 불가하므로, 반드시 MULTIPLE_CHOICE로 구현:
- 옵션 5개: 전혀 아니다(0), 아니다(1), 보통이다(2), 그렇다(3), 매우 그렇다(4)
- isRequired는 MULTIPLE_CHOICE_OPTION이 아닌 질문 그룹 레벨에서 처리 불가
  → 옵션만으로 구성 시 Tally 에디터에서 필수 설정

### 검증된 payload 패턴
| 블록 타입 | groupType | payload |
|-----------|-----------|---------|
| FORM_TITLE | FORM_TITLE | { "html": "제목" } |
| TEXT | TEXT | { "html": "설명 텍스트" } |
| HEADING_2 | HEADING_2 | { "html": "섹션 제목" } |
| DIVIDER | DIVIDER | {} |
| TITLE | TITLE | { "html": "질문 텍스트" } |
| TEXTAREA | TEXTAREA | { "isRequired": false } |
| MULTIPLE_CHOICE_OPTION | MULTIPLE_CHOICE | { "index": 0, "text": "옵션" } |
| THANK_YOU_PAGE | THANK_YOU_PAGE | { "html": "감사 메시지" } |

## 실행 절차

1. [설문 내용]을 파싱하여 블록 배열 구성
2. curl로 POST https://api.tally.so/forms 호출
3. 응답의 id로 폼 URL 출력: https://tally.so/r/{id}
4. 편집 URL도 함께 출력: https://tally.so/forms/{id}/edit

## TALLY_API_KEY
{여기에 API 키 입력 또는 환경변수 사용}

---

[설문 내용]

설문 제목: (여기에 입력)
상태: PUBLISHED 또는 DRAFT
익명 여부: (예/아니오)

문항:
(여기에 문항 목록 입력 - 각 문항에 유형 표기)
- 객관식 5점 척도: (전혀 아니다 ~ 매우 그렇다)
- 서술형: 자유 입력
- 단답형: 짧은 텍스트

예시:
[섹션 1 제목]
Q1. 질문 내용 (5점 척도)
Q2. 질문 내용 (서술형)

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
Q1. 워크숍 내용이 기대에 부합했다 (5점 척도)
Q2. 가장 유익했던 세션은 무엇입니까 (서술형)

[섹션 2 운영]
Q3. 시간 배분이 적절했다 (5점 척도)
Q4. 개선 의견이 있다면 자유롭게 작성해주세요 (서술형)

Thank you 화면: 소중한 의견 감사합니다!
```

---

## 핵심 포인트

이 프롬프트가 시행착오를 없애는 이유:

1. **groupType 규칙 명시** - 가장 빈번한 400 에러 원인을 사전 차단
2. **LINEAR_SCALE 대신 MULTIPLE_CHOICE** - 라벨 표시 불가 문제 우회
3. **MULTIPLE_CHOICE_OPTION 구조** - index/text 위치, 부모 블록 불필요 등 함정 정리
4. **금지 사항 목록** - API가 거부하는 패턴을 명시적으로 차단
5. **검증된 payload 테이블** - 각 블록별 정확한 필드만 사용
