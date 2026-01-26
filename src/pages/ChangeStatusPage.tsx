import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createStateChange, getStateChanges, getActiveAndInactiveMemberCount, getSettings } from '../lib/api';
import { MemberStatus } from '../lib/types';
import { MemberStatusBadge } from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

// 월 옵션 생성 (현재월부터 12개월)
function getMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
    options.push({ value, label });
  }

  return options;
}

export default function ChangeStatusPage() {
  useDocumentTitle('상태 변경');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 휴면 기간 선택
  const monthOptions = getMonthOptions();
  const [startMonth, setStartMonth] = useState(monthOptions[0]?.value || '');
  const [endMonth, setEndMonth] = useState(''); // 빈 값 = 무기한
  const [hasEndMonth, setHasEndMonth] = useState(false);

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
        ...(isToInactive && {
          startMonth,
          endMonth: hasEndMonth && endMonth ? endMonth : undefined,
        }),
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
          {isToInactive ? '휴면 신청' : '활동 신청'}
        </h1>

        {/* 상태 변경 표시: 활동 → 휴면 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-3">
            <MemberStatusBadge status={user.status} />
            <span className="text-gray-400 text-xl">→</span>
            <MemberStatusBadge status={targetStatus} />
          </div>
        </div>

        {/* 휴면 기간 선택 */}
        {isToInactive && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
              <span>📅</span> 휴면 기간 선택
            </h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="startMonth" className="block text-sm font-medium text-blue-700 mb-1">
                  휴면 시작월
                </label>
                <select
                  id="startMonth"
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasEndMonth"
                  checked={hasEndMonth}
                  onChange={(e) => {
                    setHasEndMonth(e.target.checked);
                    if (!e.target.checked) setEndMonth('');
                  }}
                  className="flex-shrink-0"
                />
                <label htmlFor="hasEndMonth" className="text-sm text-blue-700">
                  복귀 예정월 지정하기
                </label>
              </div>

              {hasEndMonth && (
                <div>
                  <label htmlFor="endMonth" className="block text-sm font-medium text-blue-700 mb-1">
                    복귀 예정월 (휴면 종료)
                  </label>
                  <select
                    id="endMonth"
                    value={endMonth}
                    onChange={(e) => setEndMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">선택해주세요</option>
                    {monthOptions
                      .filter((opt) => opt.value > startMonth)
                      .map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}부터 활동
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-blue-600 mt-1">
                    선택한 달부터 다시 활동 예정이에요
                  </p>
                </div>
              )}

              {!hasEndMonth && (
                <p className="text-sm text-blue-600">
                  복귀 시기가 정해지지 않았다면, 나중에 활동 신청으로 복귀할 수 있어요
                </p>
              )}
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
                <span>정원이 꽉 차면 자리가 날 때까지 활동 신청을 할 수 없어요</span>
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

        {/* 활동 신청 시 정원 부족 경고 */}
        {!isToInactive && remainingSlots <= 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-800 mb-2 flex items-center gap-2">
              <span>🚫</span> 정원이 가득 찼어요
            </h3>
            <p className="text-sm text-red-700">
              현재 정원이 꽉 차서 활동 신청을 할 수 없어요. 자리가 나면 다시 시도해주세요.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
          )}

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              {isToInactive ? '휴면 사유' : '활동 신청 사유'} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={isToInactive ? '휴면 사유를 입력해주세요' : '활동 신청 사유를 입력해주세요'}
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
                : '관리자 승인 후 활동 전환됩니다. 승인까지 시간이 걸릴 수 있습니다.'}
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || (!isToInactive && remainingSlots <= 0)}
            >
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
