import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getMembers } from '../../lib/api';
import { MemberStatus } from '../../lib/types';
import { STATUS_LABELS } from '../../lib/constants';
import { MemberStatusBadge } from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';

type FilterStatus = MemberStatus | 'all';

export default function MembersManagePage() {
  const [filter, setFilter] = useState<FilterStatus>('all');

  const allMembers = getMembers();
  const members = allMembers.filter(m => m.role !== 'admin'); // 관리자 전용 계정 제외

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => filter === 'all' || m.status === filter)
      .sort((a, b) => {
        const statusOrder: Record<MemberStatus, number> = { active: 0, inactive: 1, withdrawn: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
  }, [members, filter]);

  const statusCounts = useMemo(() => {
    return {
      all: members.length,
      active: members.filter((m) => m.status === 'active').length,
      inactive: members.filter((m) => m.status === 'inactive').length,
      withdrawn: members.filter((m) => m.status === 'withdrawn').length,
    };
  }, [members]);

  return (
    <div className="space-y-6">
      <div className="bg-white md:rounded-lg md:shadow p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">회원 관리</h1>

        {/* 필터 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'active', 'inactive', 'withdrawn'] as FilterStatus[]).map(
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

        {/* 모바일 카드 뷰 */}
        <div className="md:hidden space-y-3">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">
                    {member.name}
                    {member.position && (
                      <span className="text-gray-500 text-sm ml-1">({member.position})</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{member.email}</div>
                  <div className="text-sm text-gray-500">{member.phone}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <MemberStatusBadge status={member.status} />
                  <Link to={`/admin/members/${member.id}`}>
                    <Button size="sm" variant="secondary">수정</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 데스크톱 테이블 뷰 */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-gray-700">이름</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">담당</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">이메일</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">연락처</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">가입일</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">상태</th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 font-medium">{member.name}</td>
                  <td className="px-3 py-3 text-gray-600">{member.position || '-'}</td>
                  <td className="px-3 py-3 text-gray-600">{member.email}</td>
                  <td className="px-3 py-3 text-gray-600">{member.phone}</td>
                  <td className="px-3 py-3 text-gray-600">{member.joinedAt}</td>
                  <td className="px-3 py-3">
                    <MemberStatusBadge status={member.status} />
                  </td>
                  <td className="px-3 py-3">
                    <Link to={`/admin/members/${member.id}`}>
                      <Button size="sm" variant="secondary">수정</Button>
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
