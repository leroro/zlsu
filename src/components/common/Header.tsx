import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getActiveAndInactiveMemberCount, getSettings } from '../../lib/api';
import {
  STATUS_LABELS,
  ACTIVITY_LEVEL_LABELS,
  ACTIVITY_LEVEL_ICONS,
  SWIMMING_LEVEL_LABELS,
  SWIMMING_LEVEL_EMOJIS,
} from '../../lib/constants';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 정원 체크 (비로그인 상태에서만 필요)
  const stats = getActiveAndInactiveMemberCount();
  const settings = getSettings();
  const isFull = stats.capacityCount >= settings.maxCapacity;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  // 뒤로가기 버튼 표시 여부 (홈, 로그인, 관리자 대시보드에서는 숨김)
  const hideBackButton = ['/', '/login', '/admin'].includes(location.pathname);

  // 뒤로가기 핸들러
  const handleBack = () => {
    // 브라우저 히스토리가 있으면 뒤로가기, 없으면 홈으로
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(user?.role === 'admin' ? '/admin' : '/');
    }
  };

  // 메뉴 아이템 컴포넌트 (touch target 최소 44px 보장)
  const MenuItem = ({ to, icon, label, isActive: active }: { to: string; icon: string; label: string; isActive: boolean }) => (
    <Link
      to={to}
      onClick={closeMenu}
      className={`min-h-[44px] px-4 py-2.5 rounded-lg flex items-center gap-3 ${
        active ? 'bg-primary-700' : 'hover:bg-primary-700 active:bg-primary-800'
      }`}
    >
      <span className="w-5 text-center text-base">{icon}</span>
      <span className="text-sm">{label}</span>
    </Link>
  );

  // 섹션 헤더 컴포넌트
  const SectionHeader = ({ label }: { label: string }) => (
    <div className="px-4 py-1.5 text-xs text-primary-300/80 font-medium">{label}</div>
  );

  // 섹션 구분선
  const SectionDivider = () => <div className="border-t border-primary-500/50 my-1.5" />;

  return (
    <header className="bg-primary-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            {/* 뒤로가기 버튼 - 모바일에서 앱처럼 표시 */}
            {!hideBackButton && (
              <button
                onClick={handleBack}
                className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 hover:bg-primary-700 active:bg-primary-800 rounded-full transition-colors"
                aria-label="뒤로가기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 hover:opacity-90">
              <img src="./images/emblem.svg" alt="즐수팀 로고" className="h-6" />
              <span className="text-base font-bold">수영을 즐겁게</span>
            </Link>
          </div>

          {/* 데스크톱 메뉴 */}
          <nav className="hidden md:flex items-center gap-1">
            {user ? (
              user.role === 'admin' ? (
                // 관리자 메뉴
                <>
                  <Link to="/admin/requests" className="px-3 py-1.5 rounded hover:bg-primary-700 text-sm">
                    신청관리
                  </Link>
                  <Link to="/admin/members" className="px-3 py-1.5 rounded hover:bg-primary-700 text-sm">
                    회원관리
                  </Link>
                  <Link to="/admin/settings" className="px-3 py-1.5 rounded hover:bg-primary-700 text-sm">
                    설정
                  </Link>
                  <Link to="/rules" className="px-3 py-1.5 rounded hover:bg-primary-700 text-sm">
                    회칙
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="ml-2 px-3 py-1.5 bg-primary-700 rounded hover:bg-primary-800 text-sm"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                // 일반 회원 메뉴
                <>
                  <Link to="/about" className="px-3 py-1.5 rounded hover:bg-primary-700 text-sm">
                    소개
                  </Link>
                  {user.status !== 'pending' && (
                    <>
                      <Link to="/guide" className="px-3 py-1.5 rounded hover:bg-primary-700 text-sm">
                        필독! 가이드
                      </Link>
                      <Link to="/members" className="px-3 py-1.5 rounded hover:bg-primary-700 text-sm">
                        회원명단
                      </Link>
                    </>
                  )}
                  <Link to="/rules" className="px-3 py-1.5 rounded hover:bg-primary-700 text-sm">
                    회칙
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="ml-2 px-3 py-1.5 bg-primary-700 rounded hover:bg-primary-800 text-sm"
                  >
                    로그아웃
                  </button>
                </>
              )
            ) : (
              // 비로그인 메뉴
              <>
                <Link to="/about" className="px-3 py-1.5 rounded hover:bg-primary-700 text-sm">
                  소개
                </Link>
                <Link to="/rules" className="px-3 py-1.5 rounded hover:bg-primary-700 text-sm">
                  회칙
                </Link>
                {isFull ? (
                  <span className="px-3 py-1.5 text-primary-300 cursor-not-allowed text-sm">정원마감</span>
                ) : (
                  <Link to="/apply" className="px-3 py-1.5 rounded hover:bg-primary-700 text-sm">
                    가입신청
                  </Link>
                )}
                <Link
                  to="/login"
                  className="ml-2 px-3 py-1.5 bg-white text-primary-600 rounded hover:bg-primary-50 text-sm font-medium"
                >
                  로그인
                </Link>
              </>
            )}
          </nav>

          {/* 모바일 햄버거 버튼 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-primary-700 active:bg-primary-800 rounded-lg"
            aria-label="메뉴 열기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 오버레이 */}
      {isMenuOpen && (
        <>
          {/* 배경 오버레이 */}
          <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={closeMenu} />

          {/* 메뉴 패널 */}
          <nav className="md:hidden fixed top-14 left-0 right-0 bg-primary-600 z-50 shadow-lg max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            <div className="max-w-4xl mx-auto px-3 py-3">
              <div className="flex flex-col gap-0.5">

                {/* 사용자 카드 - 메뉴와 구분되는 별도 디자인 */}
                {user ? (
                  <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl px-4 py-3 text-gray-900 mb-1 border border-primary-100">
                    {/* 1행: 인사 + 액션 */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-bold text-gray-800">{user.name}</span>
                        <span className="text-gray-500 text-sm ml-1">님, 오늘도 화이팅! 🏊</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Link
                          to="/my"
                          onClick={closeMenu}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          내 정보
                        </Link>
                        <span className="text-gray-300">·</span>
                        <button
                          onClick={handleLogout}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          로그아웃
                        </button>
                      </div>
                    </div>
                    {/* 2행: 배지들 */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' :
                        user.status === 'inactive' ? 'bg-yellow-100 text-yellow-700' :
                        user.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {STATUS_LABELS[user.status]}
                      </span>
                      {user.status !== 'pending' && user.activityLevel && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                          {ACTIVITY_LEVEL_ICONS[user.activityLevel]} {ACTIVITY_LEVEL_LABELS[user.activityLevel]}
                        </span>
                      )}
                      {user.swimmingLevel && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-medium">
                          {SWIMMING_LEVEL_EMOJIS[user.swimmingLevel]} {SWIMMING_LEVEL_LABELS[user.swimmingLevel]}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="min-h-[44px] px-4 py-2.5 rounded-lg bg-white text-primary-600 font-medium text-center text-sm"
                  >
                    로그인
                  </Link>
                )}

                <SectionDivider />

                {user ? (
                  user.role === 'admin' ? (
                    // 관리자 모바일 메뉴
                    <>
                      <SectionHeader label="관리" />
                      <MenuItem to="/admin" icon="🏠" label="홈" isActive={isActive('/admin')} />
                      <MenuItem to="/admin/requests" icon="📋" label="신청 관리" isActive={location.pathname.startsWith('/admin/requests')} />
                      <MenuItem to="/admin/members" icon="👥" label="회원 관리" isActive={isActive('/admin/members')} />
                      <MenuItem to="/admin/settings" icon="⚙️" label="설정" isActive={isActive('/admin/settings')} />

                      <SectionDivider />
                      <SectionHeader label="운영 규정" />
                      <MenuItem to="/rules" icon="📜" label="회칙" isActive={isActive('/rules')} />
                    </>
                  ) : user.status === 'pending' ? (
                    // 승인대기 회원 모바일 메뉴
                    <>
                      <SectionHeader label="모임 활동" />
                      <MenuItem to="/" icon="🏠" label="홈" isActive={isActive('/')} />
                      <MenuItem to="/about" icon="🏊" label="소개" isActive={isActive('/about')} />

                      <SectionDivider />
                      <SectionHeader label="운영 규정" />
                      <MenuItem to="/rules" icon="📜" label="회칙" isActive={isActive('/rules')} />
                    </>
                  ) : (
                    // 일반 회원 모바일 메뉴 (active/inactive)
                    <>
                      <SectionHeader label="모임 활동" />
                      <MenuItem to="/" icon="🏠" label="홈" isActive={isActive('/')} />
                      <MenuItem to="/about" icon="🏊" label="소개" isActive={isActive('/about')} />
                      <MenuItem to="/guide" icon="📖" label="필독! 가이드" isActive={isActive('/guide')} />
                      <MenuItem to="/members" icon="👥" label="회원 명단" isActive={isActive('/members')} />

                      <SectionDivider />
                      <SectionHeader label="운영 규정" />
                      <MenuItem to="/operations" icon="📋" label="운영자 가이드" isActive={isActive('/operations')} />
                      <MenuItem to="/rules" icon="📜" label="회칙" isActive={isActive('/rules')} />
                    </>
                  )
                ) : (
                  // 비로그인 모바일 메뉴
                  <>
                    <SectionHeader label="모임 활동" />
                    <MenuItem to="/" icon="🏠" label="홈" isActive={isActive('/')} />
                    <MenuItem to="/about" icon="🏊" label="소개" isActive={isActive('/about')} />
                    {isFull ? (
                      <div className="min-h-[44px] px-4 py-2.5 rounded-lg flex items-center gap-3 text-primary-400 cursor-not-allowed">
                        <span className="w-5 text-center text-base">✍️</span>
                        <span className="text-sm">정원 마감</span>
                      </div>
                    ) : (
                      <MenuItem to="/apply" icon="✍️" label="가입 신청" isActive={isActive('/apply')} />
                    )}

                    <SectionDivider />
                    <SectionHeader label="운영 규정" />
                    <MenuItem to="/rules" icon="📜" label="회칙" isActive={isActive('/rules')} />
                  </>
                )}
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
