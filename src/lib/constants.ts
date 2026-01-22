import { MemberStatus, MemberRole, ApplicationStatus, StateChangeStatus, WithdrawalStatus, Gender, SwimmingLevel, CompetitionInterest } from './types';

// 정원
export const MAX_CAPACITY = 16;

// 상태 라벨
export const STATUS_LABELS: Record<MemberStatus, string> = {
  pending: '승인대기',
  active: '활성',
  inactive: '휴면',
  withdrawn: '탈퇴',
};

// 상태 설명
export const STATUS_DESCRIPTIONS: Record<MemberStatus, string> = {
  pending: '가입비 납부 후 승인 대기 중인 회원입니다.',
  active: '정기적으로 모임에 참여하는 회원입니다.',
  inactive: '일시적으로 모임 참여를 쉬고 있는 회원입니다. 정원에 여유가 있을 때 활성 신청이 가능합니다.',
  withdrawn: '모임에서 탈퇴한 회원입니다.',
};

// 권한 라벨 (시스템 권한)
export const ROLE_LABELS: Record<MemberRole, string> = {
  admin: '관리자',
  member: '일반회원',
};

// 성별 라벨
export const GENDER_LABELS: Record<Gender, string> = {
  male: '남',
  female: '여',
};

// 담당 역할 옵션
export const POSITION_OPTIONS = [
  { value: '', label: '없음' },
  { value: '수영 지도', label: '수영 지도' },
  { value: '수모 담당', label: '수모 담당' },
  { value: '대회 담당', label: '대회 담당' },
  { value: '소통 담당', label: '소통 담당' },
  { value: '총무 담당', label: '총무 담당' },
] as const;

// 신청 상태 라벨
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: '대기중',
  approved: '승인',
  rejected: '반려',
};

// 상태 변경 신청 라벨
export const STATE_CHANGE_STATUS_LABELS: Record<StateChangeStatus, string> = {
  pending: '대기중',
  approved: '승인',
  rejected: '반려',
};

// 탈퇴 신청 상태 라벨
export const WITHDRAWAL_STATUS_LABELS: Record<WithdrawalStatus, string> = {
  pending: '대기중',
  approved: '승인',
  rejected: '반려',
};

// 상태 뱃지 색상
export const STATUS_COLORS: Record<MemberStatus, string> = {
  pending: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-yellow-100 text-yellow-800',
  withdrawn: 'bg-gray-100 text-gray-800',
};

// 신청 상태 색상
export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

// 탈퇴 신청 상태 색상
export const WITHDRAWAL_STATUS_COLORS: Record<WithdrawalStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

// 회칙 버전
export const RULES_VERSIONS = [
  { version: 'v2.1', label: '현재 회칙 (v2.1)', path: '/rules/v2.1.md' },
  { version: 'v1.0', label: '초기 회칙 (v1.0)', path: '/rules/v1.0.md' },
];

// 약관 경로
export const TERMS = {
  RULES: '/rules/rules.md',  // 통합 회칙/운영규정
  PRIVACY_POLICY: '/terms/privacy-policy.md',
};

// 계좌 정보
export const BANK_ACCOUNT = {
  bank: '카카오뱅크 (모임통장)',
  accountNumber: '79421007218',
  accountHolder: '임미선',
  fullText: '카카오뱅크 (모임통장) 79421007218 (임미선)',
};

// 가입 시 확인해야 할 체크리스트 항목
export const SIGNUP_CHECKLIST_ITEMS = [
  {
    id: 'time',
    label: '매주 토요일 8시 정각 도착',
    description: '수영장 시계 기준, 연습 레인 입수 기준입니다. (실제 58분까지 도착 필요)',
  },
  {
    id: 'lateFee',
    label: '지각 벌금: 1분당 500원 (최대 1만원)',
    description: '당일 즐수팀 계좌로 자진 입금합니다.',
  },
  {
    id: 'absenceFee',
    label: '무단 불참 벌금: 1만원',
    description: '금요일 자정까지 불참 표시 시 면제됩니다.',
  },
  {
    id: 'monthlyFee',
    label: '월 회비: 2만원 (매월 1일 납부)',
    description: '카카오뱅크 79421007218 (임미선) 계좌로 납부합니다.',
  },
  {
    id: 'noRefund',
    label: '납부한 회비는 환불되지 않습니다',
    description: '탈퇴 또는 휴면 전환 시에도 기 납부 회비는 반환되지 않습니다.',
  },
  {
    id: 'absenceNotice',
    label: '불참 시 금요일 자정까지 일정에 불참 표시 필수',
    description: '채팅이 아닌 일정 기능에서 불참 선택해야 합니다.',
  },
  {
    id: 'swimCap',
    label: '신입 회원 수모 2장 구입 권장 (별도 입금)',
    description: '수모 가격 - 1장 2만원, 2장 3만원(장당 1.5만원)',
  },
  {
    id: 'privacy',
    label: '개인정보 수집 및 이용에 동의합니다',
    description: '이름, 연락처, 이메일 등을 모임 운영 목적으로 수집합니다.',
  },
];

// 수영 종목 (주종목 선택용)
export const SWIMMING_STROKES = [
  { id: 'freestyle', label: '자유형' },
  { id: 'backstroke', label: '배영' },
  { id: 'breaststroke', label: '평영' },
  { id: 'butterfly', label: '접영' },
] as const;

// 수영 레벨
export const SWIMMING_LEVELS: { id: SwimmingLevel; label: string }[] = [
  { id: 'beginner', label: '초급' },
  { id: 'intermediate', label: '중급' },
  { id: 'advanced', label: '상급' },
  { id: 'masters', label: '마스터' },
  { id: 'competition', label: '대회수상' },
];

// 수영 레벨 라벨
export const SWIMMING_LEVEL_LABELS: Record<SwimmingLevel, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '상급',
  masters: '마스터',
  competition: '대회수상',
};

// 수영 레벨 이모지
export const SWIMMING_LEVEL_EMOJIS: Record<SwimmingLevel, string> = {
  beginner: '🛟',
  intermediate: '🏊',
  advanced: '🐬',
  masters: '🦈',
  competition: '🏆',
};

// 대회 참가 의향 옵션
export const COMPETITION_INTEREST_OPTIONS: { id: CompetitionInterest; label: string }[] = [
  { id: 'none', label: '관심 없음' },
  { id: 'interested', label: '관심 있음' },
  { id: 'very_interested', label: '꼭 참여하고 싶음' },
];

// 대회 참가 의향 라벨
export const COMPETITION_INTEREST_LABELS: Record<CompetitionInterest, string> = {
  none: '관심 없음',
  interested: '관심 있음',
  very_interested: '꼭 참여하고 싶음',
};
