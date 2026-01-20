import { MemberStatus, MemberRole, ApplicationStatus, StateChangeStatus } from './types';

// 정원
export const MAX_CAPACITY = 16;

// 상태 라벨
export const STATUS_LABELS: Record<MemberStatus, string> = {
  active: '활동',
  inactive: '비활동',
  withdrawn: '탈퇴',
};

// 상태 설명
export const STATUS_DESCRIPTIONS: Record<MemberStatus, string> = {
  active: '정기적으로 모임에 참여하는 회원',
  inactive: '당분간 모임 참여가 어려운 회원',
  withdrawn: '모임을 탈퇴한 회원',
};

// 역할 라벨
export const ROLE_LABELS: Record<MemberRole, string> = {
  admin: '관리자',
  member: '일반회원',
};

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

// 상태 뱃지 색상
export const STATUS_COLORS: Record<MemberStatus, string> = {
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

// 회칙 버전
export const RULES_VERSIONS = [
  { version: 'v2.0', label: '현재 회칙 (v2.0)', path: '/rules/v2.0.md' },
  { version: 'v1.0', label: '초기 회칙 (v1.0)', path: '/rules/v1.0.md' },
];
