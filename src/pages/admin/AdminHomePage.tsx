import { Link } from 'react-router-dom';
import { getAdminDashboardStats, getSettings } from '../../lib/api';

export default function AdminHomePage() {
  const settings = getSettings();
  const stats = getAdminDashboardStats();

  const totalPending = stats.pendingApplications + stats.pendingStateChanges + stats.pendingWithdrawals;

  return (
    <div className="space-y-6">
      <div className="bg-white md:rounded-lg md:shadow p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">관리자 대시보드</h1>

        {/* 처리할 일이 있을 때 - 가장 눈에 띄게 */}
        {totalPending > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <h2 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
              <span className="text-xl">📋</span>
              처리할 일 {totalPending}건
            </h2>
            <div className="space-y-2">
              {stats.pendingApplications > 0 && (
                <Link
                  to="/admin/requests?tab=applications"
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200 hover:bg-yellow-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📝</span>
                    <span className="text-gray-900">가입 신청</span>
                  </div>
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                    {stats.pendingApplications}건
                  </span>
                </Link>
              )}
              {stats.pendingStateChanges > 0 && (
                <Link
                  to="/admin/requests?tab=stateChanges"
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200 hover:bg-yellow-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔄</span>
                    <span className="text-gray-900">상태 변경 신청</span>
                  </div>
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                    {stats.pendingStateChanges}건
                  </span>
                </Link>
              )}
              {stats.pendingWithdrawals > 0 && (
                <Link
                  to="/admin/requests?tab=withdrawals"
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🚪</span>
                    <span className="text-red-700 font-medium">탈퇴 신청</span>
                  </div>
                  <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full">
                    {stats.pendingWithdrawals}건
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* 처리할 일이 없을 때 */}
        {totalPending === 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <span className="text-2xl">✅</span>
            <p className="text-green-700 mt-2">처리할 신청이 없습니다.</p>
          </div>
        )}

        {/* 현황 요약 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600">{stats.capacityCount}</div>
            <div className="text-xs md:text-sm text-gray-600">현재 인원</div>
            <div className="text-xs text-gray-400">/ {settings.maxCapacity}명</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs md:text-sm text-gray-600">활성</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-yellow-600">{stats.inactive}</div>
            <div className="text-xs md:text-sm text-gray-600">휴면</div>
          </div>
          <div className={`rounded-lg p-4 text-center ${
            settings.maxCapacity - stats.capacityCount > 0 ? 'bg-gray-50' : 'bg-red-50'
          }`}>
            <div className={`text-2xl md:text-3xl font-bold ${
              settings.maxCapacity - stats.capacityCount > 0 ? 'text-gray-600' : 'text-red-600'
            }`}>
              {settings.maxCapacity - stats.capacityCount}
            </div>
            <div className="text-xs md:text-sm text-gray-600">남은 자리</div>
          </div>
        </div>

        {/* 정원 진행률 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>정원 현황</span>
            <span>{Math.round((stats.capacityCount / settings.maxCapacity) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((stats.capacityCount / settings.maxCapacity) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {settings.includeInactiveInCapacity ? '활성+휴면 기준' : '활성 회원 기준'}
          </p>
        </div>

      </div>
    </div>
  );
}
