import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createWithdrawalRequest, getWithdrawalRequests } from '../lib/api';
import Button from '../components/common/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function WithdrawPage() {
  useDocumentTitle('탈퇴 신청');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 관리자는 이 페이지 접근 불가
  if (!user || user.role === 'admin') {
    navigate(user?.role === 'admin' ? '/admin' : '/');
    return null;
  }

  // 이미 대기 중인 탈퇴 신청이 있는지 확인
  const pendingRequest = getWithdrawalRequests().find(
    (wr) => wr.memberId === user.id && wr.status === 'pending'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reason.trim()) {
      setError('탈퇴 사유를 입력해주세요.');
      return;
    }

    if (!confirmed) {
      setError('안내 사항을 확인하고 동의해주세요.');
      return;
    }

    // 최종 확인
    if (!window.confirm('정말로 탈퇴를 신청하시겠습니까?\n\n탈퇴 신청 후에는 관리자 승인 시 회원 자격이 상실됩니다.')) {
      return;
    }

    setIsLoading(true);

    try {
      createWithdrawalRequest({
        memberId: user.id,
        memberName: user.name,
        reason: reason.trim(),
      });
      navigate('/my');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">탈퇴 신청</h1>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">대기 중인 탈퇴 신청이 있습니다</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>신청일: {pendingRequest.createdAt}</p>
              <p>사유: {pendingRequest.reason}</p>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={() => navigate('/my')} variant="secondary" className="w-full">
              내 정보로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white md:rounded-lg md:shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">탈퇴 신청</h1>

        {/* 안내 사항 */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-red-800 mb-2">탈퇴 전 안내 사항</h3>
          <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
            <li>탈퇴 신청 후 관리자 승인 시 회원 자격이 상실됩니다.</li>
            <li>탈퇴 후에는 모임 활동에 참여할 수 없습니다.</li>
            <li className="font-medium">이미 납부한 회비는 반환되지 않습니다.</li>
            <li>재가입을 원하실 경우 새로 가입 신청을 해야 합니다.</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
          )}

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              탈퇴 사유 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="탈퇴 사유를 입력해주세요"
              required
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="confirmed"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="confirmed" className="text-sm text-gray-700">
              위 안내 사항을 모두 확인하였으며, <span className="font-medium text-red-600">이미 납부한 회비는 반환되지 않음</span>에 동의합니다.
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              variant="danger"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? '신청 중...' : '탈퇴 신청'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/my')}>
              취소
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
