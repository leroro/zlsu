import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createStateChange, getStateChanges } from '../lib/api';
import { MemberStatus } from '../lib/types';
import { STATUS_DESCRIPTIONS } from '../lib/constants';
import { MemberStatusBadge } from '../components/common/StatusBadge';
import Button from '../components/common/Button';

const availableStatuses: MemberStatus[] = ['active', 'inactive'];

export default function ChangeStatusPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requestedStatus, setRequestedStatus] = useState<MemberStatus | ''>('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 관리자는 이 페이지 접근 불가
  if (!user || user.role === 'admin') {
    navigate(user?.role === 'admin' ? '/admin' : '/');
    return null;
  }

  // 이미 대기 중인 신청이 있는지 확인
  const pendingRequest = getStateChanges().find(
    (sc) => sc.memberId === user.id && sc.status === 'pending'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!requestedStatus) {
      setError('변경할 상태를 선택해주세요.');
      return;
    }

    if (requestedStatus === user.status) {
      setError('현재 상태와 동일한 상태로는 변경할 수 없습니다.');
      return;
    }

    if (!reason.trim()) {
      setError('변경 사유를 입력해주세요.');
      return;
    }

    if (!confirmed) {
      setError('안내 사항을 확인해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      createStateChange({
        memberId: user.id,
        memberName: user.name,
        currentStatus: user.status,
        requestedStatus,
        reason: reason.trim(),
      });
      navigate('/');
    } catch {
      setError('신청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingRequest) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white md:rounded-lg md:shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">상태 변경 신청</h1>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">대기 중인 신청이 있습니다</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>
                현재 상태: <MemberStatusBadge status={pendingRequest.currentStatus} />
              </p>
              <p>
                요청 상태: <MemberStatusBadge status={pendingRequest.requestedStatus} />
              </p>
              <p>신청일: {pendingRequest.createdAt}</p>
              <p>사유: {pendingRequest.reason}</p>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={() => navigate('/')} variant="secondary" className="w-full">
              돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white md:rounded-lg md:shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">상태 변경 신청</h1>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            현재 상태: <MemberStatusBadge status={user.status} />
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              변경할 상태 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {availableStatuses
                .filter((status) => status !== user.status)
                .map((status) => (
                  <label
                    key={status}
                    className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                      requestedStatus === status
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={requestedStatus === status}
                        onChange={(e) => setRequestedStatus(e.target.value as MemberStatus)}
                        className="mr-3 flex-shrink-0"
                      />
                      <MemberStatusBadge status={status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 ml-6">
                      {STATUS_DESCRIPTIONS[status]}
                    </p>
                  </label>
                ))}
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              변경 사유 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="상태 변경 사유를 입력해주세요"
              required
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="confirmed"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 flex-shrink-0"
            />
            <label htmlFor="confirmed" className="text-sm text-gray-700">
              상태 변경은 관리자 승인 후 적용되며, 승인까지 최대 일주일이 걸릴 수 있습니다.
            </label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? '신청 중...' : '신청하기'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/')}>
              취소
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
