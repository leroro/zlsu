import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getActiveAndInactiveMemberCount, getSettings, getRecentJoinedMembers, getRecentStatusChanges, getStateChanges, getWithdrawalRequests, getMembersWithBirthdayThisMonth, getMembersWithBirthdayNextMonth } from '../lib/api';
import { StatusChangeHistory } from '../lib/types';
import { STATUS_LABELS, BANK_ACCOUNT, SWIMMING_LEVEL_EMOJIS } from '../lib/constants';
import Button from '../components/common/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function HomePage() {
  useDocumentTitle('홈');
  const { user } = useAuth();
  const stats = getActiveAndInactiveMemberCount();
  const settings = getSettings();
  const maxCapacity = settings.maxCapacity;
  const remainingSlots = maxCapacity - stats.capacityCount;

  // 계좌번호 복사 상태 (훅은 조건부 반환 전에 선언)
  const [copied, setCopied] = useState(false);
  const handleCopyAccount = () => {
    navigator.clipboard.writeText(BANK_ACCOUNT.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
  const birthdayThisMonth = getMembersWithBirthdayThisMonth();
  const birthdayNextMonth = getMembersWithBirthdayNextMonth();

  // 날짜 포맷 (MM.DD)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
  };

  // 월 이름
  const currentMonth = new Date().getMonth() + 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

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
      case 'to_inactive': return '휴면';
      case 'to_active': return '활성';
      case 'withdrawn': return '탈퇴';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* 환영 + 내 상태 */}
      <section className="bg-white md:rounded-lg md:shadow p-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            {user.swimmingLevel && SWIMMING_LEVEL_EMOJIS[user.swimmingLevel]} {user.position && <span className="text-gray-500 font-normal">{user.position} </span>}{user.name}님, 안녕하세요!
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
              user.status === 'active'
                ? 'bg-green-100 text-green-700'
                : user.status === 'inactive'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {user.status === 'active' ? '🟢' : user.status === 'inactive' ? '🟡' : '🔵'} {STATUS_LABELS[user.status]}
            </span>
            {/* 상태 전환 버튼 - 상태 라벨 옆에 */}
            {user.role !== 'admin' && user.status !== 'pending' && !pendingStateChange && !pendingWithdrawal && (
              <Link to="/change-status" className="text-xs text-gray-500 hover:text-gray-700 underline">
                {user.status === 'active' ? '휴면 신청하기' : '활성 신청하기'}
              </Link>
            )}
          </div>
        </div>

        {/* 대기 중인 신청 표시 */}
        {pendingStateChange && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <span className="text-yellow-600">⏳</span>
            <span className="text-yellow-800 ml-1">
              {STATUS_LABELS[pendingStateChange.requestedStatus]} 전환 신청 중
            </span>
          </div>
        )}
        {pendingWithdrawal && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm">
            <span className="text-red-600">⏳</span>
            <span className="text-red-800 ml-1">탈퇴 신청 중</span>
          </div>
        )}
      </section>

      {/* 자주 찾는 메뉴 */}
      <section className="bg-white md:rounded-lg md:shadow p-4">
        <h2 className="font-bold text-gray-900 mb-3">자주 찾는 메뉴</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* 카카오톡 팀 카톡방 - 카카오 브랜드 컬러 + 검정 테두리 */}
          {settings.kakaoInviteLink && (
            <a
              href={settings.kakaoInviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-xl transition-all hover:scale-105 border-2"
              style={{ backgroundColor: '#FEE500', borderColor: '#191919' }}
            >
              <span className="text-3xl mb-1">💬</span>
              <span className="text-sm font-bold" style={{ color: '#191919' }}>팀 카톡방</span>
            </a>
          )}
          {/* 수모 추가 구입 */}
          <Link
            to="/request/swim-cap"
            className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all hover:scale-105"
          >
            <span className="text-3xl mb-1">🏊</span>
            <span className="text-sm font-bold text-blue-900">수모 추가 구입</span>
          </Link>
        </div>
      </section>

      {/* 정원 */}
      <section className="bg-white md:rounded-lg md:shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>📊</span>
            <h2 className="font-bold text-gray-900">팀 정원</h2>
            <span className="text-xs text-gray-400">({settings.includeInactiveInCapacity ? '활성+휴면' : '활성'} 기준)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary-600">{stats.capacityCount}</span>
            <span className="text-gray-400">/ {maxCapacity}명</span>
            <span className={`text-xs px-2 py-0.5 rounded ${remainingSlots > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {remainingSlots > 0 ? `${remainingSlots}자리 남음` : '마감'}
            </span>
          </div>
        </div>
      </section>

      {/* 생일 */}
      <section className="bg-white md:rounded-lg md:shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span>🎂</span>
            <h2 className="font-bold text-gray-900">곧 생일인 회원</h2>
          </div>
          <Link to="/members?tab=birthday" className="text-xs text-primary-600 hover:text-primary-700">
            전체 보기
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">{currentMonth}월</div>
            {birthdayThisMonth.length > 0 ? (
              <div className="text-sm text-gray-800 space-y-0.5">
                {birthdayThisMonth.map(m => (
                  <div key={m.id}>
                    {m.name} <span className="text-gray-400 text-xs">({m.birthDate?.split('-')[2]}일)</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400">없음</div>
            )}
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">{nextMonth}월</div>
            {birthdayNextMonth.length > 0 ? (
              <div className="text-sm text-gray-800 space-y-0.5">
                {birthdayNextMonth.map(m => (
                  <div key={m.id}>
                    {m.name} <span className="text-gray-400 text-xs">({m.birthDate?.split('-')[2]}일)</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400">없음</div>
            )}
          </div>
        </div>
      </section>

      {/* 최근 회원 근황 */}
      <section className="bg-white md:rounded-lg md:shadow p-4">
        <div className="flex items-center gap-2 mb-3">
          <span>📋</span>
          <h2 className="font-bold text-gray-900">최신 근황</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">최근 가입</div>
            {recentJoined.length > 0 ? (
              <div className="text-sm text-gray-800 space-y-0.5">
                {recentJoined.map(m => (
                  <div key={m.id}>
                    {m.name} <span className="text-gray-400 text-xs">({formatDate(m.joinedAt)})</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400">없음</div>
            )}
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">상태 변경</div>
            {recentChanges.length > 0 ? (
              <div className="text-sm text-gray-800 space-y-0.5">
                {recentChanges.map(h => (
                  <div key={h.id}>
                    {h.memberName}({getChangeTypeLabel(h)}) <span className="text-gray-400 text-xs">({formatDate(h.changedAt)})</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400">없음</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
