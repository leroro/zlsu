#!/usr/bin/env node

/**
 * Tally 설문 폼 생성 스크립트
 * ─────────────────────────────────────
 * 설문 제목: 성과평가 면담 원온원 만족도 조사
 *
 * 사용법:
 *   TALLY_API_KEY=tly-xxxx node create-tally-form.js
 *
 * 요구사항:
 *   - Node.js 18 이상 (native fetch 사용)
 *   - Tally API 키 (Settings → API keys → Create API key)
 *
 * API 문서:
 *   - https://developers.tally.so/api-reference/introduction
 *   - https://developers.tally.so/api-reference/endpoint/forms/post
 *
 * 블록 구조 규칙 (Tally API 실제 검증 기반):
 *   - 모든 블록의 groupType === 해당 블록의 type (예: LINEAR_SCALE → groupType: "LINEAR_SCALE")
 *   - 질문 제목(TITLE)의 groupUuid → 해당 입력 블록(LINEAR_SCALE/TEXTAREA)의 uuid 참조
 *   - LINEAR_SCALE payload: { isRequired } 만 허용 (minValue/maxValue/labels는 Tally 에디터에서 설정)
 */

import crypto from 'crypto';

// ─── 설정 ─────────────────────────────────────────────

const TALLY_API_BASE = 'https://api.tally.so';
const TALLY_API_KEY = process.env.TALLY_API_KEY;

if (!TALLY_API_KEY) {
  console.error('ERROR: 환경변수 TALLY_API_KEY가 설정되지 않았습니다.');
  console.error('');
  console.error('  설정 방법:');
  console.error('    export TALLY_API_KEY=tly-xxxx');
  console.error('');
  console.error('  API 키 발급:');
  console.error('    Tally 대시보드 -> Settings -> API keys -> Create API key');
  console.error('');
  process.exit(1);
}

// ─── UUID 생성 ────────────────────────────────────────

function uuid() {
  return crypto.randomUUID();
}

// ─── 블록 생성 헬퍼 ─────────────────────────────────

function formTitleBlock(html) {
  const id = uuid();
  return {
    uuid: id,
    type: 'FORM_TITLE',
    groupUuid: id,
    groupType: 'FORM_TITLE',
    payload: { html },
  };
}

function textBlock(html) {
  const id = uuid();
  return {
    uuid: id,
    type: 'TEXT',
    groupUuid: id,
    groupType: 'TEXT',
    payload: { html },
  };
}

function headingBlock(html, level = 2) {
  const id = uuid();
  const type = `HEADING_${level}`;
  return {
    uuid: id,
    type,
    groupUuid: id,
    groupType: type,
    payload: { html },
  };
}

function dividerBlock() {
  const id = uuid();
  return {
    uuid: id,
    type: 'DIVIDER',
    groupUuid: id,
    groupType: 'DIVIDER',
    payload: {},
  };
}

/**
 * 5점 척도 문항 (LINEAR_SCALE)
 * TITLE의 groupUuid가 LINEAR_SCALE의 uuid를 참조하여 질문 그룹을 형성
 * 척도 기본값: 1~5 (Tally 에디터에서 라벨 수정 가능)
 */
function linearScaleQuestion(questionHtml, { isRequired = true } = {}) {
  const scaleId = uuid();
  const titleId = uuid();
  return [
    {
      uuid: titleId,
      type: 'TITLE',
      groupUuid: scaleId,
      groupType: 'TITLE',
      payload: { html: questionHtml },
    },
    {
      uuid: scaleId,
      type: 'LINEAR_SCALE',
      groupUuid: scaleId,
      groupType: 'LINEAR_SCALE',
      payload: { isRequired },
    },
  ];
}

/**
 * 서술형 문항 (TEXTAREA)
 * TITLE의 groupUuid가 TEXTAREA의 uuid를 참조하여 질문 그룹을 형성
 */
function textareaQuestion(questionHtml, { isRequired = false } = {}) {
  const textareaId = uuid();
  const titleId = uuid();
  return [
    {
      uuid: titleId,
      type: 'TITLE',
      groupUuid: textareaId,
      groupType: 'TITLE',
      payload: { html: questionHtml },
    },
    {
      uuid: textareaId,
      type: 'TEXTAREA',
      groupUuid: textareaId,
      groupType: 'TEXTAREA',
      payload: { isRequired },
    },
  ];
}

function thankYouPageBlock(html) {
  const id = uuid();
  return {
    uuid: id,
    type: 'THANK_YOU_PAGE',
    groupUuid: id,
    groupType: 'THANK_YOU_PAGE',
    payload: { html },
  };
}

// ─── 폼 블록 구성 ───────────────────────────────────

const blocks = [
  // 설문 제목
  formTitleBlock('성과평가 면담 원온원 만족도 조사'),

  // 익명 안내 + 소요시간
  textBlock(
    '<p>본 설문은 <strong>익명</strong>으로 진행됩니다. 응답 내용은 개인 식별 없이 종합 분석에만 활용됩니다.</p><p>예상 소요시간: <strong>2~3분</strong></p>'
  ),

  // ── 섹션 1: 면담의 명확성 ──────────────────────────
  dividerBlock(),
  headingBlock('섹션 1 면담의 명확성'),

  ...linearScaleQuestion(
    'Q1. 이번 면담에서 본인의 역할과 기대 수준이 명확히 이해되었다'
  ),
  ...linearScaleQuestion(
    'Q2. 성과 평가 기준이 이전보다 구체적으로 설명되었다'
  ),
  ...linearScaleQuestion(
    'Q3. 추상적인 피드백보다 판단 근거가 제시되었다'
  ),
  ...textareaQuestion(
    'Q4. 이번 면담에서 가장 명확하게 이해된 부분은 무엇입니까'
  ),

  // ── 섹션 2: 실질적 도움 여부 ───────────────────────
  dividerBlock(),
  headingBlock('섹션 2 실질적 도움 여부'),

  ...linearScaleQuestion(
    'Q5. 이번 면담은 향후 업무 방향 설정에 도움이 되었다'
  ),
  ...linearScaleQuestion(
    'Q6. 개선해야 할 우선순위를 스스로 정리할 수 있었다'
  ),
  ...linearScaleQuestion(
    'Q7. 면담 이후 무엇을 바꿔야 할지 떠올릴 수 있었다'
  ),
  ...textareaQuestion(
    'Q8. 면담 이후 실제로 바꿔볼 수 있겠다고 느낀 행동이 있다면 적어주세요'
  ),

  // ── 섹션 3: 소통 방식과 밀도 ───────────────────────
  dividerBlock(),
  headingBlock('섹션 3 소통 방식과 밀도'),

  ...linearScaleQuestion(
    'Q9. 면담 중 질문이나 의견을 충분히 말할 수 있었다'
  ),
  ...textareaQuestion(
    'Q10. 면담 과정에서 가장 부담되었거나 불편했던 지점이 있다면 적어주세요'
  ),

  // ── 섹션 4: 전반 평가 ─────────────────────────────
  dividerBlock(),
  headingBlock('섹션 4 전반 평가'),

  ...linearScaleQuestion(
    'Q11. 이번 성과평가 면담은 전반적으로 유의미했다'
  ),
  ...textareaQuestion(
    'Q12. 다음 면담에서 반드시 개선되었으면 하는 점 한 가지를 적어주세요'
  ),

  // 감사 문구
  textBlock('<p>설문에 참여해 주셔서 감사합니다.</p>'),

  // Thank you 화면
  thankYouPageBlock('응답이 접수되었습니다'),
];

// ─── API 요청 페이로드 ──────────────────────────────

const payload = {
  status: 'PUBLISHED',
  blocks,
};

// ─── 오류 처리 ──────────────────────────────────────

function handleError(status, data) {
  console.error(`\nAPI 오류 (${status})`);
  console.error('응답:', JSON.stringify(data, null, 2));
  console.error('');
  console.error('--- 오류 해결 체크리스트 ---');

  switch (status) {
    case 400:
      console.error('[400 Bad Request]');
      console.error('  - JSON 형식이 올바른지 확인');
      console.error('  - Content-Type 헤더가 application/json인지 확인');
      console.error('  - 필수 필드(blocks, status)가 포함되었는지 확인');
      console.error('  - 블록의 groupType이 해당 블록 type과 일치하는지 확인');
      break;
    case 401:
      console.error('[401 Unauthorized]');
      console.error('  - TALLY_API_KEY 값이 올바른지 확인');
      console.error('  - API 키가 만료되었거나 삭제되었는지 확인');
      console.error('  - 키 형식: tly-xxxx (Bearer 접두사는 코드에서 자동 추가)');
      console.error('  - 발급: Tally 대시보드 -> Settings -> API keys');
      break;
    case 403:
      console.error('[403 Forbidden]');
      console.error('  - API 키 소유 계정에 폼 생성 권한이 있는지 확인');
      console.error('  - Pro 구독이 필요한 기능을 사용 중인지 확인');
      console.error('  - 조직에서 해당 사용자가 제거되지 않았는지 확인');
      break;
    case 422:
      console.error('[422 Unprocessable Entity]');
      console.error('  - blocks 배열이 비어있지 않은지 확인');
      console.error('  - 각 블록의 uuid가 유효한 UUID v4 형식인지 확인');
      console.error('  - status 값이 BLANK/DRAFT/PUBLISHED/DELETED 중 하나인지 확인');
      console.error('  - 블록 type이 지원되는 타입인지 확인');
      break;
    case 429:
      console.error('[429 Too Many Requests]');
      console.error('  - 분당 100회 요청 제한 초과');
      console.error('  - 잠시 후 다시 시도');
      break;
    default:
      console.error(`[HTTP ${status}]`);
      console.error('  - 네트워크 연결 상태 확인');
      console.error('  - Tally 서비스 상태 확인');
      break;
  }
}

// ─── 메인 실행 ──────────────────────────────────────

async function createForm() {
  console.log('Tally API 폼 생성 요청 시작...');
  console.log('');

  const response = await fetch(`${TALLY_API_BASE}/forms`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TALLY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = await response.text();
  }

  if (!response.ok) {
    handleError(response.status, data);
    process.exit(1);
  }

  console.log('폼 생성 성공!');
  console.log('');
  console.log(`  폼 ID    : ${data.id}`);
  console.log(`  폼 이름  : ${data.name}`);
  console.log(`  상태     : ${data.status}`);
  console.log(`  생성일시 : ${data.createdAt}`);
  console.log('');
  console.log(`  폼 URL (응답자용) : https://tally.so/r/${data.id}`);
  console.log(`  편집 URL (관리자용): https://tally.so/forms/${data.id}/edit`);
}

createForm().catch((err) => {
  console.error('예기치 않은 오류:', err.message);
  process.exit(1);
});
