import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getApplications,
  approveApplication,
  rejectApplication,
  getActiveAndInactiveMemberCount,
} from '../../lib/api';
import { ApplicationStatus } from '../../lib/types';
import { MAX_CAPACITY, APPLICATION_STATUS_LABELS } from '../../lib/constants';
import { ApplicationStatusBadge } from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';

type FilterStatus = ApplicationStatus | 'all';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const applications = getApplications();
  const memberStats = getActiveAndInactiveMemberCount();
  const canAcceptMore = memberStats.total < MAX_CAPACITY;

  const filteredApplications = applications
    .filter((a) => filter === 'all' || a.status === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleApprove = (id: string) => {
    if (!user) return;
    if (!canAcceptMore) {
      alert('정원이 가득 찼습니다.');
      return;
    }

    if (confirm('이 신청을 승인하시겠습니까?')) {
      approveApplication(id, user.name);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleRejectClick = (id: string, name: string) => {
    setRejectModal({ id, name });
    setRejectReason('');
  };

  const handleRejectConfirm = () => {
    if (!user || !rejectModal) return;
    if (!rejectReason.trim()) {
      alert('반려 사유를 입력해주세요.');
      return;
    }

    rejectApplication(rejectModal.id, user.name, rejectReason.trim());
    setRejectModal(null);
    setRejectReason('');
    setRefreshKey((k) => k + 1);
  };

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="space-y-6" key={refreshKey}>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">가입 신청 관리</h1>

        {!canAcceptMore && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">
              정원이 가득 찼습니다. ({memberStats.total}/{MAX_CAPACITY}명)
            </p>
          </div>
        )}

        {/* 필터 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['pending', 'approved', 'rejected', 'all'] as FilterStatus[]).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? '전체' : APPLICATION_STATUS_LABELS[status]} ({statusCounts[status]})
            </Button>
          ))}
        </div>

        {/* 신청 목록 */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">신청 내역이 없습니다.</div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-medium text-gray-900">{application.name}</span>
                    <ApplicationStatusBadge status={application.status} />
                  </div>
                  <span className="text-sm text-gray-500">{application.createdAt}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  <div>이메일: {application.email}</div>
                  <div>연락처: {application.phone}</div>
                  {application.birthDate && <div>생년월일: {application.birthDate}</div>}
                </div>

                <div className="text-sm mb-3">
                  <span className="font-medium text-gray-700">가입 동기:</span>
                  <p className="text-gray-600 mt-1">{application.motivation}</p>
                </div>

                {application.status === 'rejected' && application.rejectReason && (
                  <div className="text-sm bg-red-50 p-2 rounded mb-3">
                    <span className="font-medium text-red-700">반려 사유:</span>
                    <p className="text-red-600 mt-1">{application.rejectReason}</p>
                  </div>
                )}

                {application.status === 'pending' && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleApprove(application.id)}
                      disabled={!canAcceptMore}
                    >
                      승인
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleRejectClick(application.id, application.name)}
                    >
                      반려
                    </Button>
                  </div>
                )}

                {application.processedAt && (
                  <div className="text-xs text-gray-400 mt-2">
                    처리: {application.processedBy} ({application.processedAt})
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 반려 모달 */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {rejectModal.name}님의 신청을 반려하시겠습니까?
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="반려 사유를 입력해주세요"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setRejectModal(null)}>
                취소
              </Button>
              <Button variant="danger" onClick={handleRejectConfirm}>
                반려
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
