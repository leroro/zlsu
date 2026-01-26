// 회원 상태 (승인대기/활동/휴면/탈퇴)
export type MemberStatus = 'pending' | 'active' | 'inactive' | 'withdrawn';

// 시스템 설정
export interface SystemSettings {
  maxCapacity: number; // 활동 회원 정원
  weeklyCapacity?: number; // 주간 참석 정원 (레인 수용 인원)
  includeInactiveInCapacity: boolean; // 휴면 회원 정원 포함 여부
  kakaoInviteLink?: string; // 카카오톡 단톡방 초대 링크
  dormancyPeriodWeeks: number; // 휴면 신청 기준 기간 (주 단위)
}

// 회원 역할
export type MemberRole = 'admin' | 'member';

// 성별
export type Gender = 'male' | 'female';

// 가입 신청 상태
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

// 상태 변경 신청 상태
export type StateChangeStatus = 'pending' | 'approved' | 'rejected';

// 탈퇴 신청 상태
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

// 주종목 (최소 2개 선택)
export interface SwimmingAbility {
  freestyle: boolean;   // 자유형
  backstroke: boolean;  // 배영
  breaststroke: boolean; // 평영
  butterfly: boolean;   // 접영
}

// 수영 레벨
export type SwimmingLevel = 'beginner' | 'intermediate' | 'advanced' | 'masters';

// 대회 경험
export type CompetitionHistory = 'none' | 'participated' | 'awarded';

// 생년월일 유형 (양력/음력)
export type BirthDateType = 'solar' | 'lunar';

// 대회 참가 의향
export type CompetitionInterest = 'none' | 'interested' | 'very_interested';

// 활동 지수 (관리자 지정)
export type ActivityLevel = 'newbie' | 'regular' | 'passionate' | 'core' | 'staff';

// 회원 인터페이스
export interface Member {
  id: string;
  email: string;
  password: string;
  name: string;
  position?: string;  // 역할 (지도, 수모, 대회, 소통, 총무 등)
  phone: string;
  gender?: Gender;  // 성별
  birthDate?: string;
  birthDateType?: BirthDateType;  // 양력/음력
  referrer?: string;  // 추천인
  swimmingAbility?: SwimmingAbility;  // 주종목
  swimmingLevel?: SwimmingLevel;  // 수영 레벨
  competitionHistory?: CompetitionHistory;  // 대회 경험 (없음/참여/입상)
  competitionInterest?: CompetitionInterest;  // 대회 참가 의향
  activityLevel?: ActivityLevel;  // 활동 지수 (관리자 지정)
  motivation?: string;  // 자기소개
  status: MemberStatus;
  role: MemberRole;
  joinedAt: string;
  updatedAt: string;
  // 이중 승인 시스템
  referrerApproval?: ReferrerApproval;
  adminApproval?: AdminApproval;
  // 카카오톡 단톡방 입장 여부
  hasJoinedKakao?: boolean;
  // 신규 회원 온보딩 완료 여부 (자기소개, 일정 확인 등)
  hasCompletedOnboarding?: boolean;
}

// 가입 신청 인터페이스
export interface Application {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  birthDate?: string;
  birthDateType?: BirthDateType;  // 양력/음력
  referrer?: string;  // 추천인
  swimmingAbility: SwimmingAbility;  // 주종목
  swimmingLevel?: SwimmingLevel;  // 수영 레벨
  competitionInterest?: CompetitionInterest;  // 대회 참가 의향
  motivation: string;
  agreedToTerms: boolean;  // 이용약관 동의
  agreedToPrivacy: boolean;  // 개인정보수집 동의
  status: ApplicationStatus;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectReason?: string;
}

// 상태 변경 신청 인터페이스
export interface StateChange {
  id: string;
  memberId: string;
  memberName: string;
  currentStatus: MemberStatus;
  requestedStatus: MemberStatus;
  reason: string;
  startMonth?: string; // 휴면 시작월 (예: "2026-02")
  endMonth?: string;   // 휴면 종료월 (없으면 무기한)
  status: StateChangeStatus;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}

// 탈퇴 신청 인터페이스
export interface WithdrawalRequest {
  id: string;
  memberId: string;
  memberName: string;
  reason: string;
  status: WithdrawalStatus;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectReason?: string;
}

// 로그인 사용자 정보 (비밀번호 제외)
export type CurrentUser = Omit<Member, 'password'>;

// 가입 시 체크리스트 항목
export interface ChecklistItem {
  id: string;
  label: string;        // 제목 (한 줄)
  description: string;  // 보조 설명
  isActive: boolean;    // 사용 여부
  order: number;        // 순서
}

// 상태 변경 이력 타입
export type StatusChangeType = 'joined' | 'to_inactive' | 'to_active' | 'withdrawn';

// 상태 변경 이력 인터페이스
export interface StatusChangeHistory {
  id: string;
  memberId: string;
  memberName: string;
  changeType: StatusChangeType;  // 변경 유형
  fromStatus?: MemberStatus;     // 이전 상태 (가입 시에는 없음)
  toStatus: MemberStatus;        // 변경된 상태
  changedAt: string;             // 변경 일시
}

// ============ 이중 승인 시스템 ============

// 승인 단계 상태
export type ApprovalStepStatus = 'pending' | 'approved' | 'rejected';

// 추천인 승인 정보
export interface ReferrerApproval {
  status: ApprovalStepStatus;
  processedAt?: string;
  agreedToSuitability?: boolean;  // 체크박스1: 적합성 추천
  agreedToMentoring?: boolean;    // 체크박스2: 멘토링 약속
  agreedToProvideCap?: boolean;   // 체크박스3: 수모 지급 약속
  rejectReason?: string;
}

// 관리자 승인 정보
export interface AdminApproval {
  status: ApprovalStepStatus;
  processedAt?: string;
  processedBy?: string;
  rejectReason?: string;
}
