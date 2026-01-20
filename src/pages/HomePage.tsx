import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getActiveAndInactiveMemberCount } from '../lib/api';
import { MAX_CAPACITY } from '../lib/constants';
import Button from '../components/common/Button';

export default function HomePage() {
  const { user } = useAuth();
  const stats = getActiveAndInactiveMemberCount();
  const remainingSlots = MAX_CAPACITY - stats.total;

  return (
    <div className="space-y-8">
      {/* 히어로 섹션 */}
      <section className="text-center py-12 bg-white rounded-lg shadow">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">즐수팀</h1>
        <p className="text-lg text-gray-600 mb-8">
          함께 즐기는 수영 모임
        </p>

        {!user && (
          <div className="flex justify-center gap-4">
            <Link to="/apply">
              <Button size="lg">가입 신청</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">로그인</Button>
            </Link>
          </div>
        )}
      </section>

      {/* 정원 현황 */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">정원 현황</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{MAX_CAPACITY}</div>
            <div className="text-sm text-gray-600">총 정원</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">활동 회원</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.inactive}</div>
            <div className="text-sm text-gray-600">비활동 회원</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-600">{remainingSlots}</div>
            <div className="text-sm text-gray-600">남은 자리</div>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>현재 인원: {stats.total}명</span>
            <span>{Math.round((stats.total / MAX_CAPACITY) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-primary-600 h-4 rounded-full transition-all"
              style={{ width: `${(stats.total / MAX_CAPACITY) * 100}%` }}
            />
          </div>
        </div>
      </section>

      {/* 바로가기 */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">바로가기</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/rules"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📜</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">회칙 보기</div>
              <div className="text-sm text-gray-600">즐수팀 운영 규칙을 확인하세요</div>
            </div>
          </Link>

          {!user && (
            <Link
              to="/apply"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">✍️</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">가입 신청</div>
                <div className="text-sm text-gray-600">즐수팀에 가입하세요</div>
              </div>
            </Link>
          )}

          {user && (
            <>
              <Link
                to="/members"
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">회원 목록</div>
                  <div className="text-sm text-gray-600">함께하는 회원들을 확인하세요</div>
                </div>
              </Link>

              <Link
                to="/my"
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">내 정보</div>
                  <div className="text-sm text-gray-600">내 정보를 확인하고 수정하세요</div>
                </div>
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
