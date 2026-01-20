// 회원 상태 (활동/비활동/탈퇴)
export type MemberStatus = 'active' | 'inactive' | 'withdrawn';

// 시스템 설정
export interface SystemSettings {
  includeInactiveInCapacity: boolean; // 비활동 회원 정원 포함 여부
}

// 회원 역할
export type MemberRole = 'admin' | 'member';

// 가입 신청 상태
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

// 상태 변경 신청 상태
export type StateChangeStatus = 'pending' | 'approved' | 'rejected';

// 회원 인터페이스
export interface Member {
  id: string;
  email: string;
  password: string;
  name: string;
  nickname?: string;
  phone: string;
  birthDate?: string;
  status: MemberStatus;
  role: MemberRole;
  joinedAt: string;
  updatedAt: string;
}

// 가입 신청 인터페이스
export interface Application {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  birthDate?: string;
  motivation: string;
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
  status: StateChangeStatus;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}

// 로그인 사용자 정보 (비밀번호 제외)
export type CurrentUser = Omit<Member, 'password'>;
