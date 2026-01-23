import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createStateChange, getStateChanges, getActiveAndInactiveMemberCount, getSettings } from '../lib/api';
import { MemberStatus } from '../lib/types';
import { MemberStatusBadge } from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { BANK_ACCOUNT } from '../lib/constants';

export default function ChangeStatusPage() {
  useDocumentTitle('상태 변경');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 클립보드 복사 유틸리티 (모바일 fallback 포함)
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      textarea.setAttribute('readonly', '');
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
        return true;
      } catch {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handleCopyAccount = async () => {
    const success = await copyToClipboard(BANK_ACCOUNT.accountNumber);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 관리자는 이 페이지 접근 불가
  if (!user || user.role === 'admin') {
    navigate(user?.role === 'admin' ? '/admin' : '/');
    return null;
  }

  // 현재 상태에 따라 변경할 상태 결정
  const targetStatus: MemberStatus = user.status === 'active' ? 'inactive' : 'active';
  const isToInactive = targetStatus === 'inactive';

  // 정원 정보
  const stats = getActiveAndInactiveMemberCount();
  const settings = getSettings();
  const remainingSlots = settings.maxCapacity - stats.capacityCount;

  // 이미 대기 중인 신청이 있는지 확인
  const pendingRequest = getStateChanges().find(
    (sc) => sc.memberId === user.id && sc.status === 'pending'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
        requestedStatus: targetStatus,
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isToInactive ? '휴면 신청' : '활성 신청'}
        </h1>

        {/* 상태 변경 표시: 활성 → 휴면 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-3">
            <MemberStatusBadge status={user.status} />
            <span className="text-gray-400 text-xl">→</span>
            <MemberStatusBadge status={targetStatus} />
          </div>
        </div>

        {/* 휴면 신청 기준 안내 */}
        {isToInactive && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <span>ℹ️</span> 휴면이란?
            </h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>
                <strong>연속 {settings.dormancyPeriodWeeks}주 이상</strong> 토요일 연습에 참여하지 못할 때 휴면 상태로 전환됩니다.
              </p>
              <ul className="space-y-1 text-blue-600">
                <li>• 휴면 중에는 회비 납부 의무가 없습니다</li>
                <li>• 팀 카톡방은 그대로 유지됩니다</li>
              </ul>
            </div>
          </div>
        )}

        {/* 휴면 신청 시 경고 */}
        {isToInactive && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
              <span>⚠️</span> 휴면 전환 시 유의사항
            </h3>
            <div className="text-sm text-yellow-700 space-y-1.5">
              <div className="flex gap-2">
                <span className="flex-shrink-0">•</span>
                <span>휴면 상태가 되면 내 자리에 다른 회원이 가입할 수 있어요</span>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0">•</span>
                <span>정원이 꽉 차면 자리가 날 때까지 활성 신청을 할 수 없어요</span>
              </div>
              <div className="flex gap-2 text-yellow-600">
                <span className="flex-shrink-0">•</span>
                <span>
                  현재 정원: {stats.capacityCount}/{settings.maxCapacity}명
                  {remainingSlots > 0
                    ? ` (${remainingSlots}자리 남음)`
                    : ' (마감)'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 활성 신청 시 회비 납부 안내 (정원 여유 있을 때만) */}
        {!isToInactive && remainingSlots > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <span>💰</span> 회비 납부 안내
            </h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>활성 전환 시 <strong>해당 월 회비(2만원)</strong>를 납부해 주세요.</p>
              <div className="bg-white rounded-lg p-3 mt-2">
                <p className="text-gray-600 text-xs mb-1">{BANK_ACCOUNT.bank}</p>
                <p className="font-mono font-bold text-gray-900">{BANK_ACCOUNT.accountNumber}</p>
                <p className="text-gray-600 text-xs">예금주: {BANK_ACCOUNT.accountHolder}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyAccount}
                className="w-full mt-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    복사 완료!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    계좌번호 복사
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 활성 신청 시 정원 부족 - 신청 불가 안내만 표시 */}
        {!isToInactive && remainingSlots <= 0 ? (
          <>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <span>🚫</span> 정원이 가득 찼어요
              </h3>
              <p className="text-sm text-red-700">
                지금은 정원이 꽉 차서 활성 신청을 할 수 없어요. 자리가 나면 다시 시도해 주세요.
              </p>
            </div>
            <div className="mt-6">
              <Button variant="secondary" className="w-full" onClick={() => navigate('/')}>
                돌아가기
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
            )}

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                {isToInactive ? '휴면 사유' : '활성 신청 사유'} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={isToInactive ? '휴면 사유를 입력해주세요' : '활성 신청 사유를 입력해주세요'}
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
                {isToInactive
                  ? '위 유의사항을 확인했으며, 관리자 승인 후 휴면 전환됩니다. 휴면 시 정원이 차면 복귀가 어려울 수 있음을 이해합니다.'
                  : '회비(2만원) 납부 확인 후 관리자가 승인합니다. 승인까지 시간이 걸릴 수 있습니다.'}
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? '신청 중...' : '신청하기'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/')}>
                취소
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
