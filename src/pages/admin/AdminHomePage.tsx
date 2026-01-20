import { Link } from 'react-router-dom';
import { getAdminDashboardStats } from '../../lib/api';
import { MAX_CAPACITY } from '../../lib/constants';

export default function AdminHomePage() {
  const stats = getAdminDashboardStats();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">관리자 홈</h1>

        {/* 대기 중인 항목 알림 */}
        {(stats.pendingApplications > 0 || stats.pendingStateChanges > 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-yellow-800 mb-2">처리 대기 중</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              {stats.pendingApplications > 0 && (
                <p>가입 신청 {stats.pendingApplications}건이 대기 중입니다.</p>
              )}
              {stats.pendingStateChanges > 0 && (
                <p>상태 변경 신청 {stats.pendingStateChanges}건이 대기 중입니다.</p>
              )}
            </div>
          </div>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">전체 회원</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">활동 회원</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.pendingApplications}</div>
            <div className="text-sm text-gray-600">가입 대기</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.pendingStateChanges}</div>
            <div className="text-sm text-gray-600">상태변경 대기</div>
          </div>
        </div>

        {/* 정원 현황 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">정원 현황</h2>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              {stats.total} / {MAX_CAPACITY}명
            </span>
            <span>{Math.round((stats.total / MAX_CAPACITY) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all"
              style={{ width: `${(stats.total / MAX_CAPACITY) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            남은 자리: {MAX_CAPACITY - stats.total}명
          </p>
        </div>

        {/* 관리 메뉴 */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">관리 메뉴</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/admin/applications"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                가입 신청 관리
                {stats.pendingApplications > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {stats.pendingApplications}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">가입 신청을 승인하거나 반려합니다</div>
            </div>
          </Link>

          <Link
            to="/admin/members"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                회원 관리
                {stats.pendingStateChanges > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {stats.pendingStateChanges}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">회원 정보를 관리하고 상태를 변경합니다</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
