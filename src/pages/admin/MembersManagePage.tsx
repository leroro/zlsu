import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getMembers,
  getStateChanges,
  approveStateChange,
  rejectStateChange,
} from '../../lib/api';
import { MemberStatus } from '../../lib/types';
import { STATUS_LABELS, ROLE_LABELS } from '../../lib/constants';
import { MemberStatusBadge, StateChangeStatusBadge } from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';

type FilterStatus = MemberStatus | 'all';

export default function MembersManagePage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [showStateChanges, setShowStateChanges] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const members = getMembers();
  const stateChanges = getStateChanges();
  const pendingStateChanges = stateChanges.filter((sc) => sc.status === 'pending');

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => filter === 'all' || m.status === filter)
      .sort((a, b) => {
        const statusOrder = { active: 0, inactive: 1, resting: 2, withdrawn: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
  }, [members, filter]);

  const statusCounts = useMemo(() => {
    return {
      all: members.length,
      active: members.filter((m) => m.status === 'active').length,
      inactive: members.filter((m) => m.status === 'inactive').length,
      resting: members.filter((m) => m.status === 'resting').length,
      withdrawn: members.filter((m) => m.status === 'withdrawn').length,
    };
  }, [members]);

  const handleApproveStateChange = (id: string) => {
    if (!user) return;
    if (confirm('이 상태 변경 요청을 승인하시겠습니까?')) {
      approveStateChange(id, user.name);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleRejectStateChange = (id: string) => {
    if (!user) return;
    if (confirm('이 상태 변경 요청을 반려하시겠습니까?')) {
      rejectStateChange(id, user.name);
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <div className="space-y-6" key={refreshKey}>
      {/* 상태 변경 신청 */}
      {pendingStateChanges.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              상태 변경 신청
              <span className="ml-2 px-2 py-0.5 text-sm bg-red-500 text-white rounded-full">
                {pendingStateChanges.length}
              </span>
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowStateChanges(!showStateChanges)}
            >
              {showStateChanges ? '접기' : '펼치기'}
            </Button>
          </div>

          {showStateChanges && (
            <div className="space-y-3">
              {pendingStateChanges.map((sc) => (
                <div key={sc.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{sc.memberName}</span>
                      <StateChangeStatusBadge status={sc.status} />
                    </div>
                    <span className="text-sm text-gray-500">{sc.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm mb-2">
                    <MemberStatusBadge status={sc.currentStatus} />
                    <span>→</span>
                    <MemberStatusBadge status={sc.requestedStatus} />
                  </div>

                  <p className="text-sm text-gray-600 mb-3">사유: {sc.reason}</p>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleApproveStateChange(sc.id)}
                    >
                      승인
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleRejectStateChange(sc.id)}
                    >
                      반려
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 회원 목록 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">회원 관리</h1>

        {/* 필터 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'active', 'inactive', 'resting', 'withdrawn'] as FilterStatus[]).map(
            (status) => (
              <Button
                key={status}
                variant={filter === status ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? '전체' : STATUS_LABELS[status]} ({statusCounts[status]})
              </Button>
            )
          )}
        </div>

        {/* 회원 목록 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">이름</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">이메일</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">연락처</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">상태</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">역할</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      {member.name}
                      {member.nickname && (
                        <span className="text-gray-500 ml-1">({member.nickname})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{member.email}</td>
                  <td className="px-4 py-3 text-gray-600">{member.phone}</td>
                  <td className="px-4 py-3">
                    <MemberStatusBadge status={member.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ROLE_LABELS[member.role]}</td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/members/${member.id}`}>
                      <Button size="sm" variant="secondary">
                        수정
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-8 text-gray-500">해당 상태의 회원이 없습니다.</div>
        )}
      </div>
    </div>
  );
}
