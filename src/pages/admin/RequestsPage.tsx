import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getApplications,
  approveApplication,
  rejectApplication,
  getStateChanges,
  approveStateChange,
  rejectStateChange,
  getWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  getActiveAndInactiveMemberCount,
  getSettings,
} from '../../lib/api';
import {
  ApplicationStatusBadge,
  MemberStatusBadge,
  StateChangeStatusBadge,
  WithdrawalStatusBadge,
} from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

type TabType = 'applications' | 'stateChanges' | 'withdrawals';

export default function RequestsPage() {
  useDocumentTitle('신청 관리');
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);

  // URL 파라미터로 탭 관리
  const currentTab = (searchParams.get('tab') as TabType) || 'applications';

  const setTab = (tab: TabType) => {
    setSearchParams({ tab });
  };

  // 데이터 로드
  const applications = getApplications();
  const stateChanges = getStateChanges();
  const withdrawalRequests = getWithdrawalRequests();
  const memberStats = getActiveAndInactiveMemberCount();
  const settings = getSettings();

  // 대기 중인 건수
  const pendingCounts = {
    applications: applications.filter((a) => a.status === 'pending').length,
    stateChanges: stateChanges.filter((s) => s.status === 'pending').length,
    withdrawals: withdrawalRequests.filter((w) => w.status === 'pending').length,
  };

  const canAcceptMore = memberStats.capacityCount < settings.maxCapacity;

  // 반려 모달 상태
  const [rejectModal, setRejectModal] = useState<{
    type: 'application' | 'withdrawal';
    id: string;
    name: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // 가입 신청 처리
  const handleApproveApplication = (id: string) => {
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

  const handleRejectApplicationClick = (id: string, name: string) => {
    setRejectModal({ type: 'application', id, name });
    setRejectReason('');
  };

  // 상태 변경 처리
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

  // 탈퇴 처리
  const handleApproveWithdrawal = (id: string, name: string) => {
    if (!user) return;
    if (confirm(`${name}님의 탈퇴 신청을 승인하시겠습니까?\n\n승인 시 해당 회원은 탈퇴 처리됩니다.`)) {
      approveWithdrawalRequest(id, user.name);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleRejectWithdrawalClick = (id: string, name: string) => {
    setRejectModal({ type: 'withdrawal', id, name });
    setRejectReason('');
  };

  // 반려 확인
  const handleRejectConfirm = () => {
    if (!user || !rejectModal) return;
    if (!rejectReason.trim()) {
      alert('반려 사유를 입력해주세요.');
      return;
    }

    if (rejectModal.type === 'application') {
      rejectApplication(rejectModal.id, user.name, rejectReason.trim());
    } else {
      rejectWithdrawalRequest(rejectModal.id, user.name, rejectReason.trim());
    }

    setRejectModal(null);
    setRejectReason('');
    setRefreshKey((k) => k + 1);
  };

  // 필터링된 데이터
  const pendingApplications = applications.filter((a) => a.status === 'pending');
  const pendingStateChanges = stateChanges.filter((s) => s.status === 'pending');
  const pendingWithdrawals = withdrawalRequests.filter((w) => w.status === 'pending');

  return (
    <div className="space-y-6" key={refreshKey}>
      <div className="bg-white md:rounded-lg md:shadow">
        {/* 헤더 */}
        <div className="p-4 md:p-6 border-b">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">신청 관리</h1>
        </div>

        {/* 탭 */}
        <div className="flex border-b overflow-x-auto">
          <button
            onClick={() => setTab('applications')}
            className={`flex-1 min-w-0 px-4 py-3 text-sm font-medium whitespace-nowrap ${
              currentTab === 'applications'
                ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            가입 신청
            {pendingCounts.applications > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {pendingCounts.applications}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('stateChanges')}
            className={`flex-1 min-w-0 px-4 py-3 text-sm font-medium whitespace-nowrap ${
              currentTab === 'stateChanges'
                ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            상태 변경
            {pendingCounts.stateChanges > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {pendingCounts.stateChanges}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('withdrawals')}
            className={`flex-1 min-w-0 px-4 py-3 text-sm font-medium whitespace-nowrap ${
              currentTab === 'withdrawals'
                ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            탈퇴 신청
            {pendingCounts.withdrawals > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {pendingCounts.withdrawals}
              </span>
            )}
          </button>
        </div>

        {/* 탭 내용 */}
        <div className="p-4 md:p-6">
          {/* 가입 신청 탭 */}
          {currentTab === 'applications' && (
            <div className="space-y-4">
              {!canAcceptMore && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">
                    정원이 가득 찼습니다. ({memberStats.capacityCount}/{settings.maxCapacity}명)
                  </p>
                </div>
              )}

              {pendingApplications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  대기 중인 가입 신청이 없습니다.
                </div>
              ) : (
                pendingApplications.map((app) => (
                  <div key={app.id} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <div>
                        <span className="font-medium text-gray-900">{app.name}</span>
                        <ApplicationStatusBadge status={app.status} />
                      </div>
                      <span className="text-sm text-gray-500">{app.createdAt}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div>이메일: {app.email}</div>
                      <div>연락처: {app.phone}</div>
                      {app.birthDate && <div>생년월일: {app.birthDate}</div>}
                      {app.referrer && <div>추천인: {app.referrer}</div>}
                    </div>

                    <div className="text-sm mb-3">
                      <span className="font-medium text-gray-700">수영 실력:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {app.swimmingAbility.freestyle && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">자유형</span>
                        )}
                        {app.swimmingAbility.backstroke && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">배영</span>
                        )}
                        {app.swimmingAbility.breaststroke && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">평영</span>
                        )}
                        {app.swimmingAbility.butterfly && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">접영</span>
                        )}
                        {!app.swimmingAbility.freestyle && !app.swimmingAbility.backstroke &&
                         !app.swimmingAbility.breaststroke && !app.swimmingAbility.butterfly && (
                          <span className="text-gray-500">없음</span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm mb-3">
                      <span className="font-medium text-gray-700">가입 동기:</span>
                      <p className="text-gray-600 mt-1">{app.motivation}</p>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleApproveApplication(app.id)}
                        disabled={!canAcceptMore}
                      >
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRejectApplicationClick(app.id, app.name)}
                      >
                        반려
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 상태 변경 탭 */}
          {currentTab === 'stateChanges' && (
            <div className="space-y-4">
              {pendingStateChanges.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  대기 중인 상태 변경 신청이 없습니다.
                </div>
              ) : (
                pendingStateChanges.map((sc) => (
                  <div key={sc.id} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <div>
                        <span className="font-medium text-gray-900">{sc.memberName}</span>
                        <StateChangeStatusBadge status={sc.status} />
                      </div>
                      <span className="text-sm text-gray-500">{sc.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm mb-3">
                      <MemberStatusBadge status={sc.currentStatus} />
                      <span className="text-gray-400">→</span>
                      <MemberStatusBadge status={sc.requestedStatus} />
                    </div>

                    <div className="text-sm mb-3">
                      <span className="font-medium text-gray-700">사유:</span>
                      <p className="text-gray-600 mt-1">{sc.reason}</p>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
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
                ))
              )}
            </div>
          )}

          {/* 탈퇴 신청 탭 */}
          {currentTab === 'withdrawals' && (
            <div className="space-y-4">
              {pendingWithdrawals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  대기 중인 탈퇴 신청이 없습니다.
                </div>
              ) : (
                pendingWithdrawals.map((wr) => (
                  <div key={wr.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <div>
                        <span className="font-medium text-red-900">{wr.memberName}</span>
                        <WithdrawalStatusBadge status={wr.status} />
                      </div>
                      <span className="text-sm text-gray-500">{wr.createdAt}</span>
                    </div>

                    <div className="text-sm mb-3">
                      <span className="font-medium text-red-700">사유:</span>
                      <p className="text-red-600 mt-1">{wr.reason}</p>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-red-200">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleApproveWithdrawal(wr.id, wr.memberName)}
                      >
                        탈퇴 승인
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRejectWithdrawalClick(wr.id, wr.memberName)}
                      >
                        반려
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 반려 모달 */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {rejectModal.name}님의 {rejectModal.type === 'application' ? '가입 신청' : '탈퇴 신청'}을 반려하시겠습니까?
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
