import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getActiveAndInactiveMemberCount, getSettings, getRecentJoinedMembers, getRecentStatusChanges, getStateChanges, getWithdrawalRequests } from '../lib/api';
import { StatusChangeHistory } from '../lib/types';
import { STATUS_LABELS } from '../lib/constants';
import Button from '../components/common/Button';

export default function HomePage() {
  const { user } = useAuth();
  const stats = getActiveAndInactiveMemberCount();
  const settings = getSettings();
  const maxCapacity = settings.maxCapacity;
  const remainingSlots = maxCapacity - stats.capacityCount;

  // 비로그인 사용자용 랜딩 페이지
  if (!user) {
    return (
      <div className="space-y-6">
        {/* 히어로 + 정원 현황 통합 */}
        <section className="bg-white md:rounded-lg md:shadow p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">수영을 즐겁게!</h1>
            <p className="text-gray-600">함께 즐기는 수영 모임</p>
          </div>

          {/* 컴팩트 정원 현황 */}
          <div className="flex items-center justify-center gap-6 mb-6 py-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{stats.capacityCount}/{maxCapacity}</div>
              <div className="text-xs text-gray-500">
                현재 인원
                <span className="text-gray-400 ml-1">
                  ({settings.includeInactiveInCapacity ? '활성+휴면' : '활성'})
                </span>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-300" />
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{remainingSlots}</div>
              <div className="text-xs text-gray-500">남은 자리</div>
            </div>
          </div>

          {/* CTA 버튼 */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {remainingSlots > 0 ? (
              <Link to="/apply">
                <Button size="lg" className="w-full sm:w-auto">가입 신청하기</Button>
              </Link>
            ) : (
              <Button size="lg" disabled className="w-full sm:w-auto bg-gray-400 cursor-not-allowed">
                정원이 꽉 차서 가입 신청할 수 없어요
              </Button>
            )}
            <Link to="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">로그인</Button>
            </Link>
          </div>

          {/* 회칙 링크 */}
          <div className="mt-4 text-center">
            <Link to="/rules" className="text-sm text-gray-500 hover:text-primary-600">
              가입 전 회칙 확인하기 →
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // 로그인 사용자용 대시보드
  const recentJoined = getRecentJoinedMembers(30);
  const recentChanges = getRecentStatusChanges(30);

  // 대기 중인 상태 변경/탈퇴 신청 확인
  const pendingStateChange = getStateChanges().find(
    (sc) => sc.memberId === user.id && sc.status === 'pending'
  );
  const pendingWithdrawal = getWithdrawalRequests().find(
    (wr) => wr.memberId === user.id && wr.status === 'pending'
  );

  // 상태 변경 타입 라벨
  const getChangeTypeLabel = (history: StatusChangeHistory): string => {
    switch (history.changeType) {
      case 'to_inactive': return '휴면 전환';
      case 'to_active': return '활성 복귀';
      case 'withdrawn': return '탈퇴';
      default: return '';
    }
  };

  // 날짜 포맷
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="space-y-4">
      {/* 환영 + 내 상태 */}
      <section className="bg-white md:rounded-lg md:shadow p-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">{user.status === 'active' ? '🟢' : '🟡'}</span>
            <span>{user.name}님, 안녕하세요!</span>
          </h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            {user.position && (
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {user.position}
              </span>
            )}
            <span className={`text-sm font-medium px-2 py-1 rounded ${
              user.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {STATUS_LABELS[user.status]}
            </span>
          </div>
        </div>

        {/* 대기 중인 신청 표시 */}
        {pendingStateChange && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <span className="text-yellow-600">⏳</span>
            <span className="text-yellow-800 ml-1">
              {STATUS_LABELS[pendingStateChange.requestedStatus]} 전환 승인 대기중
            </span>
          </div>
        )}
        {pendingWithdrawal && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
            <span className="text-red-600">⏳</span>
            <span className="text-red-800 ml-1">탈퇴 승인 대기중</span>
          </div>
        )}

        {/* 상태 전환 버튼 */}
        {!pendingStateChange && !pendingWithdrawal && (
          <div className="mt-4">
            <Link to="/change-status">
              <Button variant="secondary" className="w-full">
                {user.status === 'active' ? '휴면 전환 신청하기' : '활성 전환 신청하기'}
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* 정원 현황 */}
      <section className="bg-white md:rounded-lg md:shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">정원 현황</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {settings.includeInactiveInCapacity ? '활성+휴면 기준' : '활성 회원 기준'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-blue-50 rounded-lg text-center p-2">
            <div className="text-lg font-bold text-blue-600">{maxCapacity}</div>
            <div className="text-xs text-gray-600">정원</div>
          </div>
          <div className="bg-green-50 rounded-lg text-center p-2">
            <div className="text-lg font-bold text-green-600">{stats.active}</div>
            <div className="text-xs text-gray-600">활성</div>
          </div>
          <div className="bg-yellow-50 rounded-lg text-center p-2">
            <div className="text-lg font-bold text-yellow-600">{stats.inactive}</div>
            <div className="text-xs text-gray-600">휴면</div>
          </div>
          <div className={`rounded-lg text-center p-2 ${remainingSlots > 0 ? 'bg-gray-50' : 'bg-red-50'}`}>
            <div className={`text-lg font-bold ${remainingSlots > 0 ? 'text-gray-600' : 'text-red-600'}`}>{remainingSlots}</div>
            <div className="text-xs text-gray-600">여석</div>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 rounded-full transition-all h-2"
            style={{ width: `${Math.min((stats.capacityCount / maxCapacity) * 100, 100)}%` }}
          />
        </div>
        <div className="text-right text-xs text-gray-500 mt-1">
          {stats.capacityCount}/{maxCapacity}명 ({Math.round((stats.capacityCount / maxCapacity) * 100)}%)
        </div>
      </section>

      {/* 최근 가입 회원 */}
      <section className="bg-white md:rounded-lg md:shadow p-4">
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>🆕</span>
          <span>최근 가입 회원</span>
          <span className="text-xs text-gray-400 font-normal">(1개월 이내)</span>
        </h2>
        {recentJoined.length > 0 ? (
          <ul className="space-y-2">
            {recentJoined.slice(0, 5).map((member) => (
              <li key={member.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-900">{member.name}</span>
                <span className="text-sm text-gray-500">{formatDate(member.joinedAt)} 가입</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            최근 1개월간 신규 가입이 없습니다
          </p>
        )}
      </section>

      {/* 최근 상태 변경 */}
      <section className="bg-white md:rounded-lg md:shadow p-4">
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>💤</span>
          <span>최근 상태 변경</span>
          <span className="text-xs text-gray-400 font-normal">(1개월 이내)</span>
        </h2>
        {recentChanges.length > 0 ? (
          <ul className="space-y-2">
            {recentChanges.slice(0, 5).map((history) => (
              <li key={history.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-gray-900">{history.memberName}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    history.changeType === 'to_inactive' ? 'bg-yellow-100 text-yellow-700' :
                    history.changeType === 'to_active' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {getChangeTypeLabel(history)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{formatDate(history.changedAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            최근 1개월간 상태 변경이 없습니다
          </p>
        )}
      </section>

      {/* 바로가기 */}
      <section className="bg-white md:rounded-lg md:shadow p-4">
        <h2 className="font-bold text-gray-900 mb-3">바로가기</h2>
        <div className="grid grid-cols-3 gap-3">
          <Link to="/members">
            <Button variant="secondary" className="w-full text-sm py-3">
              👥 회원목록
            </Button>
          </Link>
          <Link to="/rules">
            <Button variant="secondary" className="w-full text-sm py-3">
              📜 회칙
            </Button>
          </Link>
          <Link to="/my">
            <Button variant="secondary" className="w-full text-sm py-3">
              👤 내 정보
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
