import { Member, Application, StateChange, CurrentUser, MemberStatus, ApplicationStatus, StateChangeStatus } from './types';
import { initialMembers, initialApplications, initialStateChanges } from './mockData';

// 로컬 스토리지 키
const STORAGE_KEYS = {
  MEMBERS: 'zlsu_members',
  APPLICATIONS: 'zlsu_applications',
  STATE_CHANGES: 'zlsu_state_changes',
  CURRENT_USER: 'zlsu_current_user',
};

// 로컬 스토리지에서 데이터 가져오기
function getStorageData<T>(key: string, initialData: T): T {
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(key, JSON.stringify(initialData));
  return initialData;
}

// 로컬 스토리지에 데이터 저장
function setStorageData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ID 생성
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 현재 날짜 문자열
function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

// ============ 회원 API ============

export function getMembers(): Member[] {
  return getStorageData(STORAGE_KEYS.MEMBERS, initialMembers);
}

export function getMemberById(id: string): Member | undefined {
  const members = getMembers();
  return members.find(m => m.id === id);
}

export function getMemberByEmail(email: string): Member | undefined {
  const members = getMembers();
  return members.find(m => m.email === email);
}

export function updateMember(id: string, updates: Partial<Member>): Member | null {
  const members = getMembers();
  const index = members.findIndex(m => m.id === id);
  if (index === -1) return null;

  members[index] = { ...members[index], ...updates, updatedAt: getCurrentDate() };
  setStorageData(STORAGE_KEYS.MEMBERS, members);
  return members[index];
}

export function deleteMember(id: string): boolean {
  const members = getMembers();
  const filtered = members.filter(m => m.id !== id);
  if (filtered.length === members.length) return false;

  setStorageData(STORAGE_KEYS.MEMBERS, filtered);
  return true;
}

export function getActiveAndInactiveMemberCount(): { active: number; inactive: number; total: number } {
  const members = getMembers();
  const activeMembers = members.filter(m => m.status === 'active' || m.status === 'inactive' || m.status === 'resting');
  return {
    active: members.filter(m => m.status === 'active').length,
    inactive: members.filter(m => m.status === 'inactive').length,
    total: activeMembers.length,
  };
}

// ============ 인증 API ============

export function login(email: string, password: string): CurrentUser | null {
  const member = getMemberByEmail(email);
  if (member && member.password === password && member.status !== 'withdrawn') {
    const { password: _, ...currentUser } = member;
    setStorageData(STORAGE_KEYS.CURRENT_USER, currentUser);
    return currentUser;
  }
  return null;
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export function getCurrentUser(): CurrentUser | null {
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return stored ? JSON.parse(stored) : null;
}

// ============ 가입 신청 API ============

export function getApplications(): Application[] {
  return getStorageData(STORAGE_KEYS.APPLICATIONS, initialApplications);
}

export function getPendingApplications(): Application[] {
  return getApplications().filter(a => a.status === 'pending');
}

export function createApplication(data: Omit<Application, 'id' | 'status' | 'createdAt'>): Application {
  const applications = getApplications();
  const newApplication: Application = {
    ...data,
    id: generateId(),
    status: 'pending',
    createdAt: getCurrentDate(),
  };
  applications.push(newApplication);
  setStorageData(STORAGE_KEYS.APPLICATIONS, applications);
  return newApplication;
}

export function approveApplication(id: string, processedBy: string): boolean {
  const applications = getApplications();
  const index = applications.findIndex(a => a.id === id);
  if (index === -1) return false;

  const application = applications[index];
  applications[index] = {
    ...application,
    status: 'approved' as ApplicationStatus,
    processedAt: getCurrentDate(),
    processedBy,
  };
  setStorageData(STORAGE_KEYS.APPLICATIONS, applications);

  // 회원으로 추가
  const members = getMembers();
  const newMember: Member = {
    id: generateId(),
    email: application.email,
    password: application.password,
    name: application.name,
    phone: application.phone,
    birthDate: application.birthDate,
    status: 'active',
    role: 'member',
    joinedAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  };
  members.push(newMember);
  setStorageData(STORAGE_KEYS.MEMBERS, members);

  return true;
}

export function rejectApplication(id: string, processedBy: string, rejectReason: string): boolean {
  const applications = getApplications();
  const index = applications.findIndex(a => a.id === id);
  if (index === -1) return false;

  applications[index] = {
    ...applications[index],
    status: 'rejected' as ApplicationStatus,
    processedAt: getCurrentDate(),
    processedBy,
    rejectReason,
  };
  setStorageData(STORAGE_KEYS.APPLICATIONS, applications);
  return true;
}

// ============ 상태 변경 신청 API ============

export function getStateChanges(): StateChange[] {
  return getStorageData(STORAGE_KEYS.STATE_CHANGES, initialStateChanges);
}

export function getPendingStateChanges(): StateChange[] {
  return getStateChanges().filter(sc => sc.status === 'pending');
}

export function createStateChange(data: {
  memberId: string;
  memberName: string;
  currentStatus: MemberStatus;
  requestedStatus: MemberStatus;
  reason: string;
}): StateChange {
  const stateChanges = getStateChanges();
  const newStateChange: StateChange = {
    ...data,
    id: generateId(),
    status: 'pending',
    createdAt: getCurrentDate(),
  };
  stateChanges.push(newStateChange);
  setStorageData(STORAGE_KEYS.STATE_CHANGES, stateChanges);
  return newStateChange;
}

export function approveStateChange(id: string, processedBy: string): boolean {
  const stateChanges = getStateChanges();
  const index = stateChanges.findIndex(sc => sc.id === id);
  if (index === -1) return false;

  const stateChange = stateChanges[index];
  stateChanges[index] = {
    ...stateChange,
    status: 'approved' as StateChangeStatus,
    processedAt: getCurrentDate(),
    processedBy,
  };
  setStorageData(STORAGE_KEYS.STATE_CHANGES, stateChanges);

  // 회원 상태 업데이트
  updateMember(stateChange.memberId, { status: stateChange.requestedStatus });

  return true;
}

export function rejectStateChange(id: string, processedBy: string): boolean {
  const stateChanges = getStateChanges();
  const index = stateChanges.findIndex(sc => sc.id === id);
  if (index === -1) return false;

  stateChanges[index] = {
    ...stateChanges[index],
    status: 'rejected' as StateChangeStatus,
    processedAt: getCurrentDate(),
    processedBy,
  };
  setStorageData(STORAGE_KEYS.STATE_CHANGES, stateChanges);
  return true;
}

// ============ 관리자 대시보드 API ============

export function getAdminDashboardStats() {
  const pendingApplications = getPendingApplications().length;
  const pendingStateChanges = getPendingStateChanges().length;
  const memberStats = getActiveAndInactiveMemberCount();

  return {
    pendingApplications,
    pendingStateChanges,
    ...memberStats,
  };
}
