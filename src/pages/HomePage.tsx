import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getActiveAndInactiveMemberCount, getSettings, getRecentJoinedMembers, getRecentStatusChanges, getStateChanges, getWithdrawalRequests, getMembersWithBirthdayThisMonth, getMembersWithBirthdayNextMonth, getPendingMembersForReferrer, getMemberById, withdrawApplication, markKakaoJoined, markOnboardingCompleted } from '../lib/api';
import { StatusChangeHistory } from '../lib/types';
import { STATUS_LABELS, BANK_ACCOUNT, SWIMMING_LEVEL_EMOJIS, canRecommendNewMember } from '../lib/constants';
import { asset } from '../lib/assets';
import Button from '../components/common/Button';
import DevQuickLogin from '../components/common/DevQuickLogin';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function HomePage() {
  useDocumentTitle('홈');
  const { user } = useAuth();
  const stats = getActiveAndInactiveMemberCount();
  const settings = getSettings();
  const maxCapacity = settings.maxCapacity;
  const remainingSlots = maxCapacity - stats.capacityCount;

  // 클립보드 복사 유틸리티 (모바일 fallback 포함)
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback: 임시 textarea 생성 (모바일 호환)
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

  // 계좌번호 복사 상태 (훅은 조건부 반환 전에 선언)
  const [copied, setCopied] = useState(false);
  const handleCopyAccount = async () => {
    const success = await copyToClipboard(BANK_ACCOUNT.accountNumber);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 초대 링크 복사 상태
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const handleCopyInviteLink = async () => {
    // 추천인 정보를 포함한 초대 링크 생성
    const referrerParam = encodeURIComponent(user?.name || '');
    const inviteUrl = `${window.location.origin}/about?ref=${referrerParam}`;
    const success = await copyToClipboard(inviteUrl);
    if (success) {
      setInviteLinkCopied(true);
      setTimeout(() => setInviteLinkCopied(false), 2000);
    }
  };

  // 환영 툴팁 임시 닫기 상태 (세션 동안만 유지)
  const [welcomeTooltipClosed, setWelcomeTooltipClosed] = useState(false);

  // 비로그인 사용자용 랜딩 페이지
  if (!user) {
    return (
      <div className="space-y-6">
        {/* 히어로 + 정원 현황 통합 */}
        <section className="bg-white md:rounded-lg md:shadow p-6">
          <div className="text-center mb-6">
            <img
              src={asset('images/logo-simple.svg')}
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
                  ({settings.includeInactiveInCapacity ? '활동+휴면' : '활동'})
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

        {/* 개발용 빠른 로그인 */}
        <DevQuickLogin />
      </div>
    );
  }

  // 승인 대기 상태(pending) 회원용 화면
  if (user && user.status === 'pending') {
    // 전체 회원 정보 조회 (referrerApproval, adminApproval 포함)
    const fullMember = getMemberById(user.id);
    const referrerApproval = fullMember?.referrerApproval;
    const adminApproval = fullMember?.adminApproval;

    // 반려 상태 확인
    const isReferrerRejected = referrerApproval?.status === 'rejected';
    const isAdminRejected = adminApproval?.status === 'rejected';
    const isRejected = isReferrerRejected || isAdminRejected;

    // 반려 처리 함수
    const handleWithdraw = () => {
      if (confirm('정말 가입을 포기하시겠습니까?\n\n모든 신청 정보가 삭제됩니다.')) {
        withdrawApplication(user.id);
        window.location.href = '/';
      }
    };

    // 반려된 경우
    if (isRejected) {
      const rejectReason = isReferrerRejected
        ? referrerApproval?.rejectReason
        : adminApproval?.rejectReason;
      const rejectedByLabel = isReferrerRejected
        ? `추천인 ${user.referrer}님`
        : '관리자';

      return (
        <div className="max-w-md mx-auto space-y-4">
          <section className="bg-white md:rounded-lg md:shadow p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">😢</div>
              <h1 className="text-xl font-bold text-red-600">가입이 반려되었습니다</h1>
              <p className="text-sm text-gray-500 mt-1">{rejectedByLabel}에 의해 반려되었습니다</p>
            </div>

            {/* 반려 사유 */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h2 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <span>📝</span> 반려 사유
              </h2>
              <p className="text-sm text-red-800">{rejectReason || '사유가 명시되지 않았습니다.'}</p>
            </div>

            {/* 안내 */}
            <div className="text-sm text-gray-600 mb-4">
              <p>신청 내용을 수정하여 다시 신청하시거나, 가입을 포기할 수 있습니다.</p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 min-w-0" onClick={handleWithdraw}>
                포기
              </Button>
              <Link to="/apply?reapply=true" className="flex-1 min-w-0">
                <Button className="w-full">재신청</Button>
              </Link>
            </div>
          </section>
        </div>
      );
    }

    // 진행 중인 경우
    const isReferrerPending = referrerApproval?.status === 'pending';
    const isReferrerApproved = referrerApproval?.status === 'approved';
    const isAdminPending = adminApproval?.status === 'pending';

    return (
      <div className="max-w-md mx-auto space-y-4">
        {/* 본인 정보 */}
        <section className="bg-white md:rounded-lg md:shadow p-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {user.swimmingLevel && SWIMMING_LEVEL_EMOJIS[user.swimmingLevel]} {user.name}님, 안녕하세요!
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                🔵 가입 대기
              </span>
            </div>
          </div>
        </section>

        {/* 상태 안내 */}
        <section className="bg-white md:rounded-lg md:shadow p-6">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🏊</div>
            <h1 className="text-xl font-bold text-gray-900">
              {isReferrerPending
                ? '추천인 동의를 기다리고 있어요'
                : '관리자 승인을 기다리고 있어요'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isReferrerPending
                ? <><span className="font-medium text-primary-600">{user.referrer}</span>님에게 동의를 요청해 주세요</>
                : '가입비 납부 확인 후 승인해 드려요'}
            </p>
          </div>

          {/* 진행 단계 표시 - 이중 승인 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> 가입 진행 현황
            </h2>
            <div className="space-y-2.5">
              {/* 1단계: 신청서 제출 - 완료 */}
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-green-600 font-medium">신청서 제출 완료</span>
              </div>

              {/* 2단계: 추천인 동의 */}
              <div className="flex items-center gap-2.5">
                {isReferrerApproved ? (
                  <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                    <span className="text-xs font-bold">2</span>
                  </div>
                )}
                <span className={`text-sm ${isReferrerApproved ? 'text-green-600 font-medium' : 'font-bold text-primary-600'}`}>
                  {isReferrerApproved ? '추천인 동의 완료' : '추천인 동의'}
                </span>
                {isReferrerPending && (
                  <span className="text-xs text-primary-500">← 지금 여기</span>
                )}
              </div>

              {/* 3단계: 관리자 승인 */}
              <div className="flex items-center gap-2.5">
                {isAdminPending ? (
                  <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                    <span className="text-xs font-bold">3</span>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold">3</span>
                  </div>
                )}
                <span className={`text-sm ${isAdminPending ? 'font-bold text-primary-600' : 'text-gray-400'}`}>
                  {isAdminPending ? '가입비 납부 확인' : '가입비 납부 확인'}
                </span>
                {isAdminPending && (
                  <span className="text-xs text-primary-500">← 지금 여기</span>
                )}
              </div>

              {/* 4단계: 팀 카톡방 입장 (가입 완료) */}
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">4</span>
                </div>
                <span className="text-sm text-gray-400">팀 카톡방 입장 (가입 완료)</span>
              </div>
            </div>
          </div>

          {/* 가입비 납부 안내 - 항상 표시 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h2 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <span>💰</span> 회비 납부 계좌 (모임통장)
              </h2>
              <div className="text-sm text-blue-800 space-y-2">
                <p>가입비 : 회비 2만원 + 수모 금액 <span className="font-bold">(수모 선택에 따라 총 3만~4만5천원)</span></p>
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

  // 추천인 동의 대기 목록 (내가 추천인인 회원)
  const pendingForMe = user.status === 'active' ? getPendingMembersForReferrer(user.name) : [];

  // 신규 회원 환영 메시지 표시 여부 (active 상태이고 아직 카톡방 미입장)
  const fullMemberData = getMemberById(user.id);
  const showWelcomeMessage = user.status === 'active' && !fullMemberData?.hasJoinedKakao;

  // 입장 후 온보딩 안내 표시 여부 (카톡방 입장 완료 && 온보딩 미완료)
  const showOnboardingGuide = user.status === 'active' && fullMemberData?.hasJoinedKakao && !fullMemberData?.hasCompletedOnboarding;

  // 카톡방 입장 버튼 클릭 핸들러
  const handleKakaoJoin = () => {
    if (settings.kakaoInviteLink) {
      markKakaoJoined(user.id);
      window.open(settings.kakaoInviteLink, '_blank');
    }
  };

  // 온보딩 완료 핸들러
  const handleCompleteOnboarding = () => {
    markOnboardingCompleted(user.id);
    window.location.reload();
  };

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
      case 'to_active': return '활동';
      case 'withdrawn': return '탈퇴';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* 환영 + 내 상태 */}
      <section className="bg-white md:rounded-lg md:shadow p-4 pt-5">
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
                {user.status === 'active' ? '휴면 신청하기' : '활동 신청하기'}
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

      {/* 신규 회원 온보딩 가이드 - 카톡방 입장 후 표시 */}
      {showOnboardingGuide && (
        <section className="bg-gradient-to-r from-green-50 to-emerald-50 border-y border-green-200 md:border md:rounded-lg md:shadow p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900 mb-2">다음 단계를 완료해주세요!</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">1.</span>
                  <span>카톡방에서 <strong>자기소개</strong>하기</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">2.</span>
                  <span>카톡방 <strong>일정(달력)</strong>에서 참석할 토요일 출석 체크</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">3.</span>
                  <span>추천인에게 <strong>수모 수령</strong>하기</span>
                </div>
              </div>
              <button
                onClick={handleCompleteOnboarding}
                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                완료했어요!
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 할 일 섹션 - 추천인 동의 대기가 있을 때만 표시 */}
      {pendingForMe.length > 0 && (
        <section className="bg-orange-50 border-y border-orange-200 md:border md:rounded-lg md:shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <h2 className="font-bold text-orange-900">할 일</h2>
              <span className="px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full font-medium">
                {pendingForMe.length}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {pendingForMe.map((pending) => (
              <Link
                key={pending.id}
                to={`/referrer-approval/${pending.id}`}
                className="flex items-center justify-between p-3 bg-white border border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>👋</span>
                  <span className="text-sm text-gray-800">
                    <span className="font-bold text-orange-700">{pending.name}</span>님의 추천인 동의 요청
                  </span>
                </div>
                <div className="flex items-center gap-1 text-orange-600 font-medium">
                  <span className="text-xs">확인하기</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 자주 찾는 메뉴 */}
      <section className="bg-white md:rounded-lg md:shadow p-4">
        <h2 className="font-bold text-gray-900 mb-3">자주 찾는 메뉴</h2>
        <div className="grid grid-cols-2 gap-3 relative">
          {/* 신규 회원 환영 툴팁 - 그리드 위에 오버레이 */}
          {showWelcomeMessage && settings.kakaoInviteLink && !welcomeTooltipClosed && (
            <div className="absolute -top-2 left-0 right-0 -translate-y-full z-10 mx-2">
              <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg relative">
                {/* X 닫기 버튼 */}
                <button
                  onClick={() => setWelcomeTooltipClosed(true)}
                  className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-gray-700"
                >
                  ✕
                </button>
                <div className="font-bold mb-1 pr-6">🎉 가입을 환영합니다!</div>
                <div className="text-gray-300 mb-2">팀 카톡방에 입장 후 자기소개 해주세요!</div>
                <button
                  onClick={() => markKakaoJoined(user.id)}
                  className="text-yellow-400 hover:text-yellow-300 text-xs underline"
                >
                  완료했어요! (다시보지 않기)
                </button>
              </div>
              {/* 말풍선 꼬리 - 왼쪽 버튼 가리킴 */}
              <div className="absolute left-8 -bottom-[7px] w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-900"></div>
            </div>
          )}
          {/* 카카오톡 팀 카톡방 - 항상 표시 */}
          {settings.kakaoInviteLink ? (
            <a
              href={settings.kakaoInviteLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => showWelcomeMessage && handleKakaoJoin()}
              className="flex flex-col items-center justify-center p-4 rounded-xl transition-all hover:scale-105 border-2"
              style={{ backgroundColor: '#FEE500', borderColor: '#191919' }}
            >
              <span className="text-3xl mb-1">💬</span>
              <span className="text-sm font-bold" style={{ color: '#191919' }}>팀 카톡방 입장</span>
            </a>
          ) : (
            <div
              className="flex flex-col items-center justify-center p-4 rounded-xl border-2 opacity-50 cursor-not-allowed"
              style={{ backgroundColor: '#FEE500', borderColor: '#191919' }}
            >
              <span className="text-3xl mb-1">💬</span>
              <span className="text-sm font-bold" style={{ color: '#191919' }}>팀 카톡방</span>
              <span className="text-xs text-gray-600">링크 준비 중</span>
            </div>
          )}
          {/* 필독! 모임 가이드 */}
          <Link
            to="/guide"
            className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all hover:scale-105"
          >
            <span className="text-3xl mb-1">📖</span>
            <span className="text-sm font-bold text-blue-900">필독! 모임 가이드</span>
          </Link>
        </div>
      </section>

      {/* 정원 */}
      <section className="bg-white md:rounded-lg md:shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>📊</span>
            <h2 className="font-bold text-gray-900">팀 정원</h2>
            <span className="text-xs text-gray-400">({settings.includeInactiveInCapacity ? '활동+휴면' : '활동'} 기준)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary-600">{stats.capacityCount}</span>
            <span className="text-gray-400">/ {maxCapacity}명</span>
            <span className={`text-xs px-2 py-0.5 rounded ${remainingSlots > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {remainingSlots > 0 ? `${remainingSlots}자리 남음` : '마감'}
            </span>
          </div>
        </div>
        {/* 열정 레벨 이상만 초대 가능 */}
        {remainingSlots > 0 && canRecommendNewMember(user.activityLevel) && (
          <button
            onClick={handleCopyInviteLink}
            className="w-full mt-3 py-2 px-4 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>🔗</span>
            {inviteLinkCopied ? '복사됨!' : '초대 링크 복사하기'}
          </button>
        )}
      </section>

      {/* 생일 */}
      <section className="bg-white md:rounded-lg md:shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span>🎂</span>
            <h2 className="font-bold text-gray-900">곧 생일</h2>
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
