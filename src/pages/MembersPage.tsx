import { useState, useMemo } from 'react';
import { getMembers } from '../lib/api';
import { MemberStatus } from '../lib/types';
import { STATUS_LABELS } from '../lib/constants';
import { MemberStatusBadge } from '../components/common/StatusBadge';
import Button from '../components/common/Button';

type FilterStatus = MemberStatus | 'all';

export default function MembersPage() {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const members = getMembers();

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => m.status !== 'withdrawn')
      .filter((m) => filter === 'all' || m.status === filter)
      .sort((a, b) => {
        // 활동 > 비활동 > 휴식 순으로 정렬
        const statusOrder = { active: 0, inactive: 1, resting: 2, withdrawn: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
  }, [members, filter]);

  const statusCounts = useMemo(() => {
    const counts: Record<FilterStatus, number> = {
      all: members.filter((m) => m.status !== 'withdrawn').length,
      active: members.filter((m) => m.status === 'active').length,
      inactive: members.filter((m) => m.status === 'inactive').length,
      resting: members.filter((m) => m.status === 'resting').length,
      withdrawn: 0,
    };
    return counts;
  }, [members]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">회원 목록</h1>

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
          <Button
            variant={filter === 'resting' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('resting')}
          >
            {STATUS_LABELS.resting} ({statusCounts.resting})
          </Button>
        </div>

        {/* 회원 목록 */}
        <div className="space-y-3">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              해당 상태의 회원이 없습니다.
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {member.name}
                      {member.nickname && (
                        <span className="text-gray-500 ml-2">({member.nickname})</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      가입일: {member.joinedAt}
                    </div>
                  </div>
                </div>
                <MemberStatusBadge status={member.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
