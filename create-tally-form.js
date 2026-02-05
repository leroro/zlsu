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
 * API 규칙 (실전 검증 기반):
 *   - 모든 블록의 groupType === 해당 블록의 type
 *   - 질문 제목(TITLE)의 groupUuid → 해당 입력 블록의 uuid 참조
 *   - LINEAR_SCALE payload: start/end/step/hasLeftLabel/leftLabel/hasRightLabel/rightLabel
 *     (❌ minValue/maxValue/minLabel/maxLabel → tally-js 타입 정의 오류)
 *   - MULTIPLE_CHOICE_OPTION: payload { index, text, isFirst, isLast }
 *   - RATING: payload { stars } (❌ maxValue)
 *
 * 환경 참고:
 *   - Node.js fetch가 DNS 문제(EAI_AGAIN)를 일으킬 수 있음
 *   - 그 경우: node create-tally-form.js --json > payload.json && curl -X POST ...
 */

import crypto from 'crypto';
import { writeFileSync } from 'fs';

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
 * 척도 문항 (LINEAR_SCALE)
 * 올바른 필드: start, end, step, hasLeftLabel, leftLabel, hasRightLabel, rightLabel
 * ❌ minValue/maxValue/minLabel/maxLabel (tally-js 타입 정의 오류)
 */
function linearScaleQuestion(questionHtml, {
  isRequired = true,
  start = 1,
  end = 10,
  step = 1,
  leftLabel = '전혀 아니다',
  rightLabel = '매우 그렇다',
} = {}) {
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
      payload: {
        isRequired,
        start,
        end,
        step,
        hasLeftLabel: true,
        leftLabel,
        hasRightLabel: true,
        rightLabel,
      },
    },
  ];
}

/**
 * 서술형 문항 (TEXTAREA)
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

/**
 * 단일 선택 문항 (MULTIPLE_CHOICE)
 * options: string[] — 선택지 라벨 배열
 */
function multipleChoiceQuestion(questionHtml, options) {
  const groupId = uuid();
  const titleId = uuid();
  return [
    {
      uuid: titleId,
      type: 'TITLE',
      groupUuid: groupId,
      groupType: 'TITLE',
      payload: { html: questionHtml },
    },
    ...options.map((text, i) => ({
      uuid: uuid(),
      type: 'MULTIPLE_CHOICE_OPTION',
      groupUuid: groupId,
      groupType: 'MULTIPLE_CHOICE',
      payload: {
        index: i,
        text,
        isFirst: i === 0,
        isLast: i === options.length - 1,
      },
    })),
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
    '<p>본 설문은 익명으로 진행됩니다. 응답 내용은 개인 식별 없이 종합 분석에만 활용됩니다.</p><p>예상 소요시간: 2~3분</p>'
  ),

  // 면담자 선택 (단일 선택)
  ...multipleChoiceQuestion('면담자를 선택해 주세요', [
    '임미선 대표',
    '이현우 이사',
  ]),

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

// ─── JSON 출력 모드 ─────────────────────────────────

if (process.argv.includes('--json')) {
  const output = JSON.stringify(payload, null, 2);
  writeFileSync('/tmp/tally-payload.json', output);
  console.log('Payload saved to /tmp/tally-payload.json');
  console.log(`Total blocks: ${blocks.length}`);
  console.log('');
  console.log('curl로 전송:');
  console.log(`  curl -X POST "${TALLY_API_BASE}/forms" \\`);
  console.log(`    -H "Authorization: Bearer $TALLY_API_KEY" \\`);
  console.log('    -H "Content-Type: application/json" \\');
  console.log('    -d @/tmp/tally-payload.json');
  process.exit(0);
}

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
      console.error('  - 블록의 groupType이 해당 블록 type과 일치하는지 확인');
      console.error('  - LINEAR_SCALE: start/end/step 사용 (❌ minValue/maxValue)');
      console.error('  - MULTIPLE_CHOICE_OPTION: isFirst/isLast 포함 확인');
      break;
    case 401:
      console.error('[401 Unauthorized]');
      console.error('  - TALLY_API_KEY 값이 올바른지 확인');
      console.error('  - 키 형식: tly-xxxx');
      break;
    case 403:
      console.error('[403 Forbidden]');
      console.error('  - API 키 권한 확인');
      break;
    case 429:
      console.error('[429 Too Many Requests]');
      console.error('  - 분당 100회 요청 제한 초과');
      break;
    default:
      console.error(`[HTTP ${status}]`);
      console.error('  - 네트워크 연결 상태 확인');
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
  if (err.cause?.code === 'EAI_AGAIN') {
    console.error('DNS 해석 실패. --json 모드로 payload를 생성 후 curl로 전송하세요:');
    console.error('  node create-tally-form.js --json');
    console.error('  curl -X POST "https://api.tally.so/forms" \\');
    console.error('    -H "Authorization: Bearer $TALLY_API_KEY" \\');
    console.error('    -H "Content-Type: application/json" \\');
    console.error('    -d @/tmp/tally-payload.json');
  } else {
    console.error('예기치 않은 오류:', err.message);
  }
  process.exit(1);
});
