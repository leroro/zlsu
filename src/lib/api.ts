import { Member, Application, StateChange, CurrentUser, MemberStatus, ApplicationStatus, StateChangeStatus, WithdrawalRequest, WithdrawalStatus, SystemSettings, ChecklistItem, StatusChangeHistory, StatusChangeType, ReferrerApproval, AdminApproval } from './types';
import { initialMembers, initialApplications, initialStateChanges, initialStatusChangeHistory } from './mockData';

// 로컬 스토리지 키
const STORAGE_KEYS = {
  MEMBERS: 'zlsu_members',
  APPLICATIONS: 'zlsu_applications',
  STATE_CHANGES: 'zlsu_state_changes',
  WITHDRAWAL_REQUESTS: 'zlsu_withdrawal_requests',
  CURRENT_USER: 'zlsu_current_user',
  SETTINGS: 'zlsu_settings',
  CHECKLIST_ITEMS: 'zlsu_checklist_items',
  STATUS_CHANGE_HISTORY: 'zlsu_status_change_history',
};

// localStorage를 mockData로 강제 리셋 (개발용 - 전체 초기화)
export function resetToMockData(): void {
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(initialMembers));
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(initialApplications));
  localStorage.setItem(STORAGE_KEYS.STATE_CHANGES, JSON.stringify(initialStateChanges));
  localStorage.removeItem(STORAGE_KEYS.WITHDRAWAL_REQUESTS);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}

// 데이터 버전 (정원 임시 확장 20명 - 가입 테스트용)
const DATA_VERSION = 14;
const DATA_VERSION_KEY = 'zlsu_data_version';

// 앱 초기화 - 데이터가 없거나 버전이 다르면 mock 데이터로 초기화
export function initializeAppData(): void {
  const storedVersion = localStorage.getItem(DATA_VERSION_KEY);
  const needsReset = storedVersion !== String(DATA_VERSION);

  if (needsReset) {
    // 버전이 다르면 전체 데이터 초기화 (로그인 세션도 초기화)
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(initialMembers));
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(initialApplications));
    localStorage.setItem(STORAGE_KEYS.STATE_CHANGES, JSON.stringify(initialStateChanges));
    localStorage.removeItem(STORAGE_KEYS.WITHDRAWAL_REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);  // 설정도 리셋 (maxCapacity 등)
    localStorage.setItem(DATA_VERSION_KEY, String(DATA_VERSION));
    return;
  }

  // 회원 데이터가 없으면 초기화
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(initialMembers));
  }
  // 신청 데이터가 없으면 초기화
  if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(initialApplications));
  }
  // 상태 변경 데이터가 없으면 초기화
  if (!localStorage.getItem(STORAGE_KEYS.STATE_CHANGES)) {
    localStorage.setItem(STORAGE_KEYS.STATE_CHANGES, JSON.stringify(initialStateChanges));
  }
}

// 기본 설정
const DEFAULT_SETTINGS: SystemSettings = {
  maxCapacity: 20, // 연습 정원 (TODO: 테스트 후 14로 복원)
  weeklyCapacity: 14, // 주간 참석 정원 (레인 수용 인원)
  includeInactiveInCapacity: false, // 기본값: 활동 회원만 정원에 포함
  kakaoInviteLink: 'https://invite.kakao.com/tc/yOTCtJKzHs', // 카카오톡 단톡방 초대 링크
  dormancyPeriodWeeks: 3, // 휴면 신청 기준: 3주 이상 불참 시
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

export function getActiveAndInactiveMemberCount(): { active: number; inactive: number; total: number; capacityCount: number } {
  const members = getMembers();
  const settings = getSettings();

  // 관리자 전용 계정은 정원 계산에서 제외
  const regularMembers = members.filter(m => m.role !== 'admin');

  const activeCount = regularMembers.filter(m => m.status === 'active').length;
  const inactiveCount = regularMembers.filter(m => m.status === 'inactive').length;

  // 정원 계산: 설정에 따라 휴면 회원 포함 여부 결정
  const capacityCount = settings.includeInactiveInCapacity
    ? activeCount + inactiveCount
    : activeCount;

  return {
    active: activeCount,
    inactive: inactiveCount,
    total: activeCount + inactiveCount,
    capacityCount,
  };
}

// ============ 설정 API ============

export function getSettings(): SystemSettings {
  const stored = getStorageData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  // 기존 저장된 설정과 기본값 병합 (새로 추가된 필드 포함)
  return { ...DEFAULT_SETTINGS, ...stored };
}

export function updateSettings(updates: Partial<SystemSettings>): SystemSettings {
  const settings = getSettings();
  const newSettings = { ...settings, ...updates };
  setStorageData(STORAGE_KEYS.SETTINGS, newSettings);
  return newSettings;
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

export function changePassword(memberId: string, currentPassword: string, newPassword: string): { success: boolean; error?: string } {
  const member = getMemberById(memberId);
  if (!member) {
    return { success: false, error: '회원 정보를 찾을 수 없습니다.' };
  }

  if (member.password !== currentPassword) {
    return { success: false, error: '현재 비밀번호가 일치하지 않습니다.' };
  }

  if (newPassword.length < 6) {
    return { success: false, error: '새 비밀번호는 6자 이상이어야 합니다.' };
  }

  updateMember(memberId, { password: newPassword });
  return { success: true };
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
    referrer: application.referrer,
    swimmingAbility: application.swimmingAbility,
    swimmingLevel: application.swimmingLevel,
    motivation: application.motivation,
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

// ============ 신규 가입 (pending 상태로 바로 회원 등록) ============

// 가입 신청 시 바로 pending 상태의 Member로 등록
export function createPendingMember(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  birthDate?: string;
  birthDateType?: Member['birthDateType'];
  referrer?: string;
  swimmingAbility?: Member['swimmingAbility'];
  swimmingLevel?: Member['swimmingLevel'];
  competitionHistory?: Member['competitionHistory'];
  competitionInterest?: Member['competitionInterest'];
  motivation?: string;
}): Member {
  const members = getMembers();
  const newMember: Member = {
    id: generateId(),
    email: data.email,
    password: data.password,
    name: data.name,
    phone: data.phone,
    birthDate: data.birthDate,
    birthDateType: data.birthDateType,
    referrer: data.referrer,
    swimmingAbility: data.swimmingAbility,
    swimmingLevel: data.swimmingLevel,
    competitionHistory: data.competitionHistory,
    competitionInterest: data.competitionInterest,
    motivation: data.motivation,
    status: 'pending',
    role: 'member',
    joinedAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
    // 이중 승인 시스템: 추천인 승인 대기로 시작
    referrerApproval: { status: 'pending' },
  };
  members.push(newMember);
  setStorageData(STORAGE_KEYS.MEMBERS, members);
  return newMember;
}

// pending 상태 회원 목록 조회
export function getPendingMembers(): Member[] {
  return getMembers().filter(m => m.status === 'pending');
}

// pending 회원 승인 (active로 변경)
export function approvePendingMember(id: string): boolean {
  const member = getMemberById(id);
  if (!member || member.status !== 'pending') return false;

  updateMember(id, { status: 'active' });
  return true;
}

// pending 회원 반려 (삭제)
export function rejectPendingMember(id: string): boolean {
  const member = getMemberById(id);
  if (!member || member.status !== 'pending') return false;

  return deleteMember(id);
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
  startMonth?: string; // 휴면 시작월
  endMonth?: string;   // 휴면 종료월 (복귀 예정월)
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
  const member = getMemberById(stateChange.memberId);
  const updateData: Partial<Member> = { status: stateChange.requestedStatus };

  // 휴면 → 활동 복귀 시 활동지수를 '일반'으로 리셋 (스태프는 유지)
  if (stateChange.requestedStatus === 'active' && member?.activityLevel !== 'staff') {
    updateData.activityLevel = 'regular';
  }

  updateMember(stateChange.memberId, updateData);

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

// ============ 탈퇴 신청 API ============

export function getWithdrawalRequests(): WithdrawalRequest[] {
  return getStorageData(STORAGE_KEYS.WITHDRAWAL_REQUESTS, []);
}

export function getPendingWithdrawalRequests(): WithdrawalRequest[] {
  return getWithdrawalRequests().filter(wr => wr.status === 'pending');
}

export function createWithdrawalRequest(data: {
  memberId: string;
  memberName: string;
  reason: string;
}): WithdrawalRequest {
  const requests = getWithdrawalRequests();
  const newRequest: WithdrawalRequest = {
    ...data,
    id: generateId(),
    status: 'pending',
    createdAt: getCurrentDate(),
  };
  requests.push(newRequest);
  setStorageData(STORAGE_KEYS.WITHDRAWAL_REQUESTS, requests);
  return newRequest;
}

export function approveWithdrawalRequest(id: string, processedBy: string): boolean {
  const requests = getWithdrawalRequests();
  const index = requests.findIndex(wr => wr.id === id);
  if (index === -1) return false;

  const request = requests[index];
  requests[index] = {
    ...request,
    status: 'approved' as WithdrawalStatus,
    processedAt: getCurrentDate(),
    processedBy,
  };
  setStorageData(STORAGE_KEYS.WITHDRAWAL_REQUESTS, requests);

  // 회원 상태를 탈퇴로 변경
  updateMember(request.memberId, { status: 'withdrawn' });

  return true;
}

export function rejectWithdrawalRequest(id: string, processedBy: string, rejectReason: string): boolean {
  const requests = getWithdrawalRequests();
  const index = requests.findIndex(wr => wr.id === id);
  if (index === -1) return false;

  requests[index] = {
    ...requests[index],
    status: 'rejected' as WithdrawalStatus,
    processedAt: getCurrentDate(),
    processedBy,
    rejectReason,
  };
  setStorageData(STORAGE_KEYS.WITHDRAWAL_REQUESTS, requests);
  return true;
}

// ============ 관리자 대시보드 API ============

export function getAdminDashboardStats() {
  const pendingApplications = getPendingApplications().length;
  const pendingMembersCount = getPendingMembers().length;
  const pendingStateChanges = getPendingStateChanges().length;
  const pendingWithdrawals = getPendingWithdrawalRequests().length;
  const memberStats = getActiveAndInactiveMemberCount();

  return {
    pendingApplications,
    pendingMembers: pendingMembersCount,
    pendingStateChanges,
    pendingWithdrawals,
    ...memberStats,
  };
}

// ============ 생일 API ============

// 특정 월의 생일 회원 조회 (활동/휴면 회원만)
export function getMembersWithBirthdayByMonth(month: number): Member[] {
  const members = getMembers();

  return members
    .filter((member) => {
      // 관리자 제외
      if (member.role === 'admin') return false;
      // 활동 또는 휴면 회원만
      if (member.status !== 'active' && member.status !== 'inactive') return false;
      // 생년월일이 없으면 제외
      if (!member.birthDate) return false;

      // 생년월일에서 월 추출 (YYYY-MM-DD 형식)
      const birthMonth = parseInt(member.birthDate.split('-')[1], 10);
      return birthMonth === month;
    })
    .sort((a, b) => {
      // 일자 기준 정렬
      const dayA = parseInt(a.birthDate!.split('-')[2], 10);
      const dayB = parseInt(b.birthDate!.split('-')[2], 10);
      return dayA - dayB;
    });
}

// 이번 달 생일인 회원 조회
export function getMembersWithBirthdayThisMonth(): Member[] {
  const currentMonth = new Date().getMonth() + 1;
  return getMembersWithBirthdayByMonth(currentMonth);
}

// 다음 달 생일인 회원 조회
export function getMembersWithBirthdayNextMonth(): Member[] {
  const currentMonth = new Date().getMonth() + 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  return getMembersWithBirthdayByMonth(nextMonth);
}

// ============ 체크리스트 API ============

// 기본 체크리스트 항목 (신규 회원 인지 순서대로 정리)
// label: 명사형 제목, description: ~요 문장
const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  // [1. 회칙 동의 - 가장 먼저]
  {
    id: 'rulesConfirm',
    label: '회칙 확인 및 동의',
    description: '회칙 전체 내용을 확인하였으며, 이에 동의합니다.',
    isActive: true,
    order: 1,
  },
  // [2. 활동 참여]
  {
    id: 'activity',
    label: '토요일 8시 정각 입수 (수영장 시계)',
    description: '매주 토요일 8시 정각에 입수하겠습니다. 티타임은 자율 참석임을 인지하였습니다.',
    isActive: true,
    order: 2,
  },
  // [3. 가입 비용]
  {
    id: 'joinFee',
    label: '첫 달 4만원 납부',
    description: '가입 승인 후 첫 달 회비 4만원을 납부하겠습니다. (회비 2만 + 수모 2만)',
    isActive: true,
    order: 3,
  },
  {
    id: 'monthlyFee',
    label: '매월 회비 2만원 납부',
    description: '매월 1일에 회비 2만원을 납부하겠습니다. 납부한 회비는 환불되지 않음을 인지하였습니다.',
    isActive: true,
    order: 4,
  },
  // [4. 출석 체크]
  {
    id: 'attendance',
    label: '금요일 자정까지 출석 체크',
    description: "카톡 '일정'에서 참석/불참을 표시하겠습니다. 미표시 후 불참 시 벌금이 발생함을 인지하였습니다.",
    isActive: true,
    order: 5,
  },
  // [5. 벌금 규정]
  {
    id: 'penalty',
    label: '지각·무단불참 시 벌금',
    description: '지각 1분당 500원(최대 1만원), 무단불참 1만원을 납부하겠습니다.',
    isActive: true,
    order: 6,
  },
  // [6. 개인정보 동의]
  {
    id: 'agreeAll',
    label: '개인정보 수집·이용 동의',
    description: '이름, 연락처, 이메일 등을 모임 운영 목적으로 수집하는 것에 동의합니다.',
    isActive: true,
    order: 7,
  },
];

// 체크리스트 버전 (항목 변경 시 증가시키면 자동 초기화됨)
const CHECKLIST_VERSION = 12;

export function getChecklistItems(): ChecklistItem[] {
  const versionKey = 'zlsu_checklist_version';
  const storedVersion = localStorage.getItem(versionKey);

  // 버전이 다르면 기본값으로 초기화
  if (storedVersion !== String(CHECKLIST_VERSION)) {
    localStorage.setItem(versionKey, String(CHECKLIST_VERSION));
    setStorageData(STORAGE_KEYS.CHECKLIST_ITEMS, DEFAULT_CHECKLIST_ITEMS);
    return DEFAULT_CHECKLIST_ITEMS;
  }

  return getStorageData(STORAGE_KEYS.CHECKLIST_ITEMS, DEFAULT_CHECKLIST_ITEMS);
}

export function getActiveChecklistItems(): ChecklistItem[] {
  return getChecklistItems()
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order);
}

export function saveChecklistItems(items: ChecklistItem[]): void {
  setStorageData(STORAGE_KEYS.CHECKLIST_ITEMS, items);
}

export function addChecklistItem(item: Omit<ChecklistItem, 'id' | 'order'>): ChecklistItem {
  const items = getChecklistItems();
  const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) : 0;
  const newItem: ChecklistItem = {
    ...item,
    id: generateId(),
    order: maxOrder + 1,
  };
  items.push(newItem);
  saveChecklistItems(items);
  return newItem;
}

export function updateChecklistItem(id: string, updates: Partial<ChecklistItem>): ChecklistItem | null {
  const items = getChecklistItems();
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return null;

  items[index] = { ...items[index], ...updates };
  saveChecklistItems(items);
  return items[index];
}

export function deleteChecklistItem(id: string): boolean {
  const items = getChecklistItems();
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return false;

  // 순서 재정렬
  filtered.sort((a, b) => a.order - b.order);
  filtered.forEach((item, index) => {
    item.order = index + 1;
  });

  saveChecklistItems(filtered);
  return true;
}

export function reorderChecklistItems(items: ChecklistItem[]): void {
  // 순서 재정렬
  items.forEach((item, index) => {
    item.order = index + 1;
  });
  saveChecklistItems(items);
}

// ============ 상태 변경 이력 관리 ============

// 상태 변경 이력 조회
export function getStatusChangeHistory(): StatusChangeHistory[] {
  return getStorageData<StatusChangeHistory[]>(STORAGE_KEYS.STATUS_CHANGE_HISTORY, initialStatusChangeHistory);
}

// 상태 변경 이력 저장
function saveStatusChangeHistory(history: StatusChangeHistory[]): void {
  setStorageData(STORAGE_KEYS.STATUS_CHANGE_HISTORY, history);
}

// 상태 변경 이력 추가
export function addStatusChangeHistory(
  memberId: string,
  memberName: string,
  changeType: StatusChangeType,
  toStatus: MemberStatus,
  fromStatus?: MemberStatus
): StatusChangeHistory {
  const history = getStatusChangeHistory();
  const newEntry: StatusChangeHistory = {
    id: generateId(),
    memberId,
    memberName,
    changeType,
    fromStatus,
    toStatus,
    changedAt: new Date().toISOString(),
  };
  history.push(newEntry);
  saveStatusChangeHistory(history);
  return newEntry;
}

// 최근 가입 회원 조회 (N일 이내)
export function getRecentJoinedMembers(days: number = 30): Member[] {
  const members = getMembers();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return members
    .filter(m => {
      if (m.role === 'admin') return false; // 관리자 제외
      // 승인 완료된 회원만 (pending, withdrawn 제외)
      if (m.status === 'pending' || m.status === 'withdrawn') return false;
      const joinedDate = new Date(m.joinedAt);
      return joinedDate >= cutoffDate;
    })
    .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
}

// 최근 상태 변경 이력 조회 (N일 이내, 가입 제외)
export function getRecentStatusChanges(days: number = 30): StatusChangeHistory[] {
  const history = getStatusChangeHistory();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return history
    .filter(h => {
      const changedDate = new Date(h.changedAt);
      return changedDate >= cutoffDate && h.changeType !== 'joined';
    })
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
}

// ============ 이중 승인 시스템 API ============

// 특정 추천인의 승인 대기 회원 목록 조회
export function getPendingMembersForReferrer(referrerName: string): Member[] {
  return getMembers().filter(m =>
    m.status === 'pending' &&
    m.referrer === referrerName &&
    m.referrerApproval?.status === 'pending'
  );
}

// 추천인 동의
export function referrerApproveMember(
  memberId: string,
  agreedToSuitability: boolean,
  agreedToMentoring: boolean,
  agreedToProvideCap: boolean
): boolean {
  const member = getMemberById(memberId);
  if (!member || member.status !== 'pending') return false;
  if (member.referrerApproval?.status !== 'pending') return false;

  const referrerApproval: ReferrerApproval = {
    status: 'approved',
    processedAt: getCurrentDate(),
    agreedToSuitability,
    agreedToMentoring,
    agreedToProvideCap,
  };

  // 추천인 승인 후 관리자 승인 대기 상태로 전환
  const adminApproval: AdminApproval = { status: 'pending' };

  updateMember(memberId, { referrerApproval, adminApproval });
  return true;
}

// 추천인 반려
export function referrerRejectMember(memberId: string, rejectReason: string): boolean {
  const member = getMemberById(memberId);
  if (!member || member.status !== 'pending') return false;
  if (member.referrerApproval?.status !== 'pending') return false;

  const referrerApproval: ReferrerApproval = {
    status: 'rejected',
    processedAt: getCurrentDate(),
    rejectReason,
  };

  updateMember(memberId, { referrerApproval });
  return true;
}

// 관리자 승인 대기 회원 목록 조회 (추천인 승인 완료된 건만)
export function getMembersAwaitingAdminApproval(): Member[] {
  return getMembers().filter(m =>
    m.status === 'pending' &&
    m.referrerApproval?.status === 'approved' &&
    m.adminApproval?.status === 'pending'
  );
}

// 관리자 승인 (추천인 승인 후에만 가능)
export function adminApprovePendingMember(memberId: string, processedBy: string): boolean {
  const member = getMemberById(memberId);
  if (!member || member.status !== 'pending') return false;
  if (member.referrerApproval?.status !== 'approved') return false;
  if (member.adminApproval?.status !== 'pending') return false;

  const adminApproval: AdminApproval = {
    status: 'approved',
    processedAt: getCurrentDate(),
    processedBy,
  };

  // 회원 상태를 active로 변경, 활동지수는 뉴비로 시작
  updateMember(memberId, {
    adminApproval,
    status: 'active',
    joinedAt: getCurrentDate(),
    activityLevel: 'newbie',
  });

  // 가입 이력 추가
  addStatusChangeHistory(memberId, member.name, 'joined', 'active');

  return true;
}

// 관리자 반려
export function adminRejectPendingMember(
  memberId: string,
  processedBy: string,
  rejectReason: string
): boolean {
  const member = getMemberById(memberId);
  if (!member || member.status !== 'pending') return false;
  if (member.referrerApproval?.status !== 'approved') return false;
  if (member.adminApproval?.status !== 'pending') return false;

  const adminApproval: AdminApproval = {
    status: 'rejected',
    processedAt: getCurrentDate(),
    processedBy,
    rejectReason,
  };

  updateMember(memberId, { adminApproval });
  return true;
}

// 반려 후 재신청 (승인 상태 초기화)
export function reapplyMember(memberId: string, updates?: Partial<Member>): boolean {
  const member = getMemberById(memberId);
  if (!member || member.status !== 'pending') return false;

  // 추천인 또는 관리자에게 반려된 상태인지 확인
  const isReferrerRejected = member.referrerApproval?.status === 'rejected';
  const isAdminRejected = member.adminApproval?.status === 'rejected';

  if (!isReferrerRejected && !isAdminRejected) return false;

  // 승인 상태 초기화 (다시 추천인 승인 대기부터 시작)
  const referrerApproval: ReferrerApproval = { status: 'pending' };

  updateMember(memberId, {
    ...updates,
    referrerApproval,
    adminApproval: undefined,
    updatedAt: getCurrentDate(),
  });

  return true;
}

// 가입 포기 (신청 데이터 삭제)
export function withdrawApplication(memberId: string): boolean {
  const member = getMemberById(memberId);
  if (!member || member.status !== 'pending') return false;

  return deleteMember(memberId);
}

// ============ 카카오톡 단톡방 입장 API ============

// 카카오톡 단톡방 입장 완료 처리
export function markKakaoJoined(memberId: string): boolean {
  const member = getMemberById(memberId);
  if (!member) return false;

  updateMember(memberId, { hasJoinedKakao: true });
  return true;
}

// 신규 회원 온보딩 완료 처리
export function markOnboardingCompleted(memberId: string): boolean {
  const member = getMemberById(memberId);
  if (!member) return false;

  updateMember(memberId, { hasCompletedOnboarding: true });
  return true;
}

// ============ 활동 지수 API ============

// 회원 활동 지수 업데이트 (관리자 전용)
export function updateMemberActivityLevel(memberId: string, activityLevel: Member['activityLevel']): boolean {
  const member = getMemberById(memberId);
  if (!member) return false;

  updateMember(memberId, { activityLevel });
  return true;
}

// 뉴비 → 일반 자동 승급 체크 (가입 후 2개월 경과 시)
export function checkAndUpgradeNewbies(): number {
  const members = getMembers();
  const today = new Date();
  let upgradedCount = 0;

  members.forEach(member => {
    // 활동 상태이고 뉴비인 회원만 체크
    if (member.status === 'active' && member.activityLevel === 'newbie' && member.joinedAt) {
      const joinedDate = new Date(member.joinedAt);
      const monthsDiff = (today.getFullYear() - joinedDate.getFullYear()) * 12
        + (today.getMonth() - joinedDate.getMonth());

      // 2개월 이상 경과 시 일반으로 자동 승급
      if (monthsDiff >= 2) {
        updateMember(member.id, { activityLevel: 'regular' });
        upgradedCount++;
      }
    }
  });

  return upgradedCount;
}
