import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getActiveAndInactiveMemberCount, getSettings, getRecentJoinedMembers, getRecentStatusChanges, getStateChanges, getWithdrawalRequests, getMembersWithBirthdayThisMonth } from '../lib/api';
import { StatusChangeHistory } from '../lib/types';
import { STATUS_LABELS, BANK_ACCOUNT } from '../lib/constants';
import Button from '../components/common/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function HomePage() {
  useDocumentTitle('홈');
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
            <img
              src="./images/logo-simple.svg"
              alt="즐수팀 로고"
              className="w-20 h-20 mx-auto mb-3 rounded-lg"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-1">즐겁게 수영하는 사람들</h1>
            <p className="text-gray-600">즐수팀</p>
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
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">로그인</Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">모임 소개 보기</Button>
            </Link>
          </div>

          {/* 가입 안내 */}
          <div className="mt-4 text-center text-sm text-gray-500">
            {remainingSlots > 0 ? (
              <>
                아직 회원이 아니신가요?{' '}
                <Link to="/apply" className="text-primary-600 hover:text-primary-700 font-medium">
                  가입 신청하기
                </Link>
              </>
            ) : (
              <span className="text-gray-400">현재 정원이 마감되었습니다</span>
            )}
          </div>
        </section>
      </div>
    );
  }

  // 계좌번호 복사 상태
  const [copied, setCopied] = useState(false);
  const handleCopyAccount = () => {
    navigator.clipboard.writeText(BANK_ACCOUNT.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 승인 대기 상태(pending) 회원용 화면
  if (user && user.status === 'pending') {
    return (
      <div className="max-w-md mx-auto space-y-4">
        {/* 상태 안내 */}
        <section className="bg-white md:rounded-lg md:shadow p-6">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🏊</div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}님, 가입 신청이 완료되었어요!</h1>
            <p className="text-sm text-gray-500 mt-1">아래 계좌로 가입비를 납부해주세요.</p>
          </div>

          {/* 가입비 납부 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h2 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span>💰</span> 가입비를 납부해주세요
            </h2>
            <div className="text-sm text-blue-800 space-y-2">
              <p>첫 달 회비 2만원 + 수모 2만원 = <span className="font-bold">총 4만원</span></p>
              <div className="bg-white rounded-lg p-3 mt-3">
                <p className="text-gray-600 text-xs mb-1">{BANK_ACCOUNT.bank}</p>
                <p className="font-mono font-bold text-lg text-gray-900">{BANK_ACCOUNT.accountNumber}</p>
                <p className="text-gray-600 text-xs">예금주: {BANK_ACCOUNT.accountHolder}</p>
              </div>
              <button
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

          {/* 진행 단계 표시 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> 가입 진행 현황
            </h2>
            <div className="space-y-2.5">
              {/* 1단계: 가입 신청 - 완료 */}
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-gray-300 text-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-400">가입 신청</span>
              </div>

              {/* 2단계: 가입비 납부 & 승인 대기 - 현재 */}
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                  <span className="text-xs font-bold">2</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-primary-600">가입비 납부 & 승인 대기</span>
                  <p className="text-xs text-gray-500 mt-0.5">입금하셨다면 총무 확인을 기다려주세요</p>
                </div>
              </div>

              {/* 3단계: 카톡방 초대 - 대기 */}
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">3</span>
                </div>
                <span className="text-sm text-gray-400">카톡방 · 모임통장 초대</span>
              </div>

              {/* 4단계: 수모 수령 - 대기 */}
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">4</span>
                </div>
                <span className="text-sm text-gray-400">수모 수령</span>
              </div>

              {/* 5단계: 토요일 수영 - 대기 */}
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">5</span>
                </div>
                <span className="text-sm text-gray-400">토요일에 만나요! 🏊</span>
              </div>
            </div>
          </div>

          {/* 문의 안내 - 추천인 강조 */}
          <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
            {user.referrer && user.referrer !== '없음' ? (
              <p>
                문의사항은 <span className="font-bold text-primary-600">{user.referrer}</span>님(추천인)에게 연락해주세요.
              </p>
            ) : (
              <p>문의사항은 총무에게 연락해주세요.</p>
            )}
          </div>
        </section>

        {/* 바로가기 */}
        <section className="bg-white md:rounded-lg md:shadow p-4">
          <div className="grid grid-cols-2 gap-3">
            <Link to="/rules">
              <Button variant="secondary" className="w-full text-sm py-3">
                📜 회칙 확인
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

  // 로그인 사용자용 대시보드
  const recentJoined = getRecentJoinedMembers(30);
  const recentChanges = getRecentStatusChanges(30);
  const birthdayMembers = getMembersWithBirthdayThisMonth();
  const currentMonth = new Date().getMonth() + 1;

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
            <span className="text-2xl">{user.status === 'active' ? '🟢' : user.status === 'inactive' ? '🟡' : '🔵'}</span>
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
                : user.status === 'inactive'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-blue-100 text-blue-700'
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

        {/* 상태 전환 버튼 - 관리자와 승인대기 회원에게는 표시하지 않음 */}
        {user.role !== 'admin' && user.status !== 'pending' && !pendingStateChange && !pendingWithdrawal && (
          <div className="mt-4">
            <Link to="/change-status">
              <Button variant="secondary" className="w-full">
                {user.status === 'active' ? '휴면 전환 신청하기' : '활성 전환 신청하기'}
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* 이번 달 생일 */}
      {birthdayMembers.length > 0 && (
        <section className="bg-white md:rounded-lg md:shadow p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>🎂</span>
            <span>{currentMonth}월 생일</span>
            <span className="text-xs text-gray-400 font-normal">({birthdayMembers.length}명)</span>
          </h2>
          <ul className="space-y-2">
            {birthdayMembers.map((member) => {
              const day = parseInt(member.birthDate!.split('-')[2], 10);
              const isLunar = member.birthDateType === 'lunar';
              return (
                <li key={member.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-900">{member.name}</span>
                  <span className="text-sm text-gray-500">
                    {currentMonth}/{day}
                    {isLunar && <span className="text-xs text-purple-500 ml-1">(음력)</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

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
              👥 회원명단
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
