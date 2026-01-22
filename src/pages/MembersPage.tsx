import { useState, useMemo } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { getMembers, getStateChanges, getWithdrawalRequests, getMembersWithBirthdayByMonth } from '../lib/api';
import { MemberStatus } from '../lib/types';
import { STATUS_LABELS, GENDER_LABELS } from '../lib/constants';
import { MemberStatusBadge } from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../contexts/AuthContext';

type FilterStatus = MemberStatus | 'all';
type TabType = 'members' | 'birthday';

export default function MembersPage() {
  useDocumentTitle('회원 명단');
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // pending 회원은 접근 불가
  if (user?.status === 'pending') {
    return <Navigate to="/" replace />;
  }

  // 탭 상태 (URL 파라미터 기반)
  const currentTab: TabType = searchParams.get('tab') === 'birthday' ? 'birthday' : 'members';
  const setTab = (tab: TabType) => {
    if (tab === 'members') {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  // 생일 월 선택 (현재 월 기본값)
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [filter, setFilter] = useState<FilterStatus>('all');
  const members = getMembers();
  const stateChanges = getStateChanges();
  const withdrawalRequests = getWithdrawalRequests();

  // 회원별 대기 중인 신청 확인
  const getPendingRequest = (memberId: string) => {
    const pendingStateChange = stateChanges.find(
      (sc) => sc.memberId === memberId && sc.status === 'pending'
    );
    const pendingWithdrawal = withdrawalRequests.find(
      (wr) => wr.memberId === memberId && wr.status === 'pending'
    );

    if (pendingWithdrawal) {
      return { type: 'withdrawal' as const, label: '탈퇴 신청중' };
    }
    if (pendingStateChange) {
      return {
        type: 'stateChange' as const,
        label: `${STATUS_LABELS[pendingStateChange.requestedStatus]} 전환 신청중`
      };
    }
    return null;
  };

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => m.role !== 'admin') // 관리자 전용 계정 제외
      .filter((m) => m.status !== 'withdrawn' && m.status !== 'pending') // 탈퇴/승인대기 제외
      .filter((m) => filter === 'all' || m.status === filter)
      .sort((a, b) => {
        // 활성 > 휴면 순으로 정렬
        const statusOrder: Record<MemberStatus, number> = { pending: 0, active: 1, inactive: 2, withdrawn: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
  }, [members, filter]);

  const statusCounts = useMemo(() => {
    const regularMembers = members.filter((m) => m.role !== 'admin');
    const counts: Record<FilterStatus, number> = {
      all: regularMembers.filter((m) => m.status !== 'withdrawn' && m.status !== 'pending').length,
      pending: 0, // 일반 회원 목록에서는 표시 안 함
      active: regularMembers.filter((m) => m.status === 'active').length,
      inactive: regularMembers.filter((m) => m.status === 'inactive').length,
      withdrawn: 0,
    };
    return counts;
  }, [members]);

  // 생일 회원 목록
  const birthdayMembers = useMemo(() => {
    return getMembersWithBirthdayByMonth(selectedMonth);
  }, [selectedMonth]);

  return (
    <div className="space-y-6">
      <div className="bg-white md:rounded-lg md:shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">회원</h1>

        {/* 탭 */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setTab('members')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              currentTab === 'members'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            👥 명단
          </button>
          <button
            onClick={() => setTab('birthday')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              currentTab === 'birthday'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🎂 생일
          </button>
        </div>

        {/* 회원 명단 탭 */}
        {currentTab === 'members' && (
          <>
            {/* 필터 버튼 */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={filter === 'all' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                전체 ({statusCounts.all})
              </Button>
              <Button
                variant={filter === 'active' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                {STATUS_LABELS.active} ({statusCounts.active})
              </Button>
              <Button
                variant={filter === 'inactive' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('inactive')}
              >
                {STATUS_LABELS.inactive} ({statusCounts.inactive})
              </Button>
            </div>

        {/* 회원 목록 */}
        <div className="space-y-3">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              해당 상태의 회원이 없습니다.
            </div>
          ) : (
            filteredMembers.map((member) => {
              const pendingRequest = getPendingRequest(member.id);
              return (
                <div
                  key={member.id}
                  className={`p-4 rounded-lg ${
                    member.role === 'admin' ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                  }`}
                >
                  {/* 상단: 이름, 상태 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        member.role === 'admin' ? 'bg-primary-500 text-white' : 'bg-primary-100'
                      }`}>
                        <span className={`font-medium ${member.role === 'admin' ? '' : 'text-primary-600'}`}>
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900">{member.name}</span>
                          {member.position && (
                            <span className="text-sm text-gray-500">({member.position})</span>
                          )}
                          {member.role === 'admin' && (
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-primary-600 text-white rounded">
                              스탭
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.gender && <span>{GENDER_LABELS[member.gender]}</span>}
                          {member.gender && <span className="mx-1">·</span>}
                          <span>가입일 {member.joinedAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <MemberStatusBadge status={member.status} />
                      {pendingRequest && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          pendingRequest.type === 'withdrawal'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {pendingRequest.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 수영 실력 */}
                  {member.swimmingAbility && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1">
                        {member.swimmingAbility.freestyle && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">자유형</span>
                        )}
                        {member.swimmingAbility.backstroke && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">배영</span>
                        )}
                        {member.swimmingAbility.breaststroke && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">평영</span>
                        )}
                        {member.swimmingAbility.butterfly && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">접영</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 가입 동기 */}
                  {member.motivation && (
                    <div className="text-sm text-gray-600 bg-white rounded p-2">
                      {member.motivation}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
          </>
        )}

        {/* 생일 탭 */}
        {currentTab === 'birthday' && (
          <>
            {/* 월 선택 */}
            <div className="flex flex-wrap gap-1 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    selectedMonth === month
                      ? 'bg-primary-600 text-white'
                      : month === currentMonth
                      ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {month}월
                </button>
              ))}
            </div>

            {/* 생일 회원 목록 */}
            <div className="space-y-3">
              {birthdayMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {selectedMonth}월에 생일인 회원이 없습니다.
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    {selectedMonth}월 생일 회원 {birthdayMembers.length}명
                  </p>
                  {birthdayMembers.map((member) => {
                    const day = parseInt(member.birthDate!.split('-')[2], 10);
                    const isLunar = member.birthDateType === 'lunar';
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                            <span className="text-pink-600 font-medium">{member.name.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{member.name}</span>
                              <MemberStatusBadge status={member.status} />
                            </div>
                            {member.position && (
                              <span className="text-sm text-gray-500">{member.position}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {selectedMonth}월 {day}일
                          </div>
                          {isLunar && (
                            <span className="text-xs text-purple-600">음력</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
