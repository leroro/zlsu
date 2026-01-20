import { Member, Application, StateChange } from './types';

// 초기 회원 데이터
export const initialMembers: Member[] = [
  {
    id: '1',
    email: 'admin@swimteam.com',
    password: 'admin123',
    name: '관리자',
    nickname: '어드민',
    phone: '010-1234-5678',
    birthDate: '1990-01-01',
    status: 'active',
    role: 'admin',
    joinedAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    email: 'user1@test.com',
    password: 'user123',
    name: '김철수',
    nickname: '수영왕',
    phone: '010-2222-3333',
    birthDate: '1995-05-15',
    status: 'active',
    role: 'member',
    joinedAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '3',
    email: 'user2@test.com',
    password: 'user123',
    name: '이영희',
    nickname: '돌고래',
    phone: '010-3333-4444',
    birthDate: '1992-08-20',
    status: 'active',
    role: 'member',
    joinedAt: '2024-02-01',
    updatedAt: '2024-02-01',
  },
  {
    id: '4',
    email: 'user3@test.com',
    password: 'user123',
    name: '박민수',
    phone: '010-4444-5555',
    status: 'inactive',
    role: 'member',
    joinedAt: '2024-02-15',
    updatedAt: '2024-03-01',
  },
  {
    id: '5',
    email: 'user4@test.com',
    password: 'user123',
    name: '최지은',
    nickname: '물개',
    phone: '010-5555-6666',
    birthDate: '1998-12-10',
    status: 'resting',
    role: 'member',
    joinedAt: '2024-03-01',
    updatedAt: '2024-04-01',
  },
];

// 초기 가입 신청 데이터
export const initialApplications: Application[] = [
  {
    id: '1',
    name: '신청자A',
    email: 'applicant1@test.com',
    password: 'test123',
    phone: '010-6666-7777',
    motivation: '수영을 배우고 싶어서 가입 신청합니다.',
    status: 'pending',
    createdAt: '2024-05-01',
  },
  {
    id: '2',
    name: '신청자B',
    email: 'applicant2@test.com',
    password: 'test123',
    phone: '010-7777-8888',
    birthDate: '2000-03-25',
    motivation: '건강을 위해 수영 모임에 참여하고 싶습니다.',
    status: 'pending',
    createdAt: '2024-05-02',
  },
];

// 초기 상태 변경 신청 데이터
export const initialStateChanges: StateChange[] = [
  {
    id: '1',
    memberId: '4',
    memberName: '박민수',
    currentStatus: 'inactive',
    requestedStatus: 'active',
    reason: '다시 활동을 시작하고 싶습니다.',
    status: 'pending',
    createdAt: '2024-05-01',
  },
];
