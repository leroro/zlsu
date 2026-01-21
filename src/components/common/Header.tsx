import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { STATUS_LABELS } from '../../lib/constants';
import { getActiveAndInactiveMemberCount, getSettings } from '../../lib/api';

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

  return (
    <header className="bg-primary-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            {/* 뒤로가기 버튼 - 모바일에서 앱처럼 표시 */}
            {!hideBackButton && (
              <button
                onClick={handleBack}
                className="md:hidden p-2 -ml-2 hover:bg-primary-700 rounded-full transition-colors"
                aria-label="뒤로가기"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 hover:opacity-90">
              <img
                src="./images/emblem.svg"
                alt="즐수팀 로고"
                className="h-7"
              />
              <span className="text-lg font-bold">수영을 즐겁게</span>
            </Link>
          </div>

          {/* 데스크톱 메뉴 */}
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/rules" className="hover:text-primary-100">
              회칙
            </Link>

            {user ? (
              user.role === 'admin' ? (
                // 관리자 메뉴
                <>
                  <Link to="/admin/requests" className="hover:text-primary-100">
                    신청관리
                  </Link>
                  <Link to="/admin/members" className="hover:text-primary-100">
                    회원관리
                  </Link>
                  <Link to="/admin/settings" className="hover:text-primary-100">
                    설정
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 bg-primary-700 rounded hover:bg-primary-800"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                // 일반 회원 메뉴
                <>
                  <Link to="/my" className="hover:text-primary-100">
                    내 정보
                  </Link>
                  <Link to="/rules" className="hover:text-primary-100">
                    회칙
                  </Link>
                  {user.status !== 'pending' && (
                    <Link to="/members" className="hover:text-primary-100">
                      회원 명단
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 bg-primary-700 rounded hover:bg-primary-800"
                  >
                    로그아웃
                  </button>
                </>
              )
            ) : (
              <>
                <Link to="/about" className="hover:text-primary-100">
                  소개
                </Link>
                {isFull ? (
                  <span className="text-primary-300 cursor-not-allowed text-sm">
                    정원 마감
                  </span>
                ) : (
                  <Link to="/apply" className="hover:text-primary-100">
                    가입신청
                  </Link>
                )}
                <Link
                  to="/login"
                  className="px-3 py-1 bg-white text-primary-600 rounded hover:bg-primary-50"
                >
                  로그인
                </Link>
              </>
            )}
          </nav>

          {/* 모바일 햄버거 버튼 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-primary-700 rounded"
            aria-label="메뉴 열기"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-primary-500">
            <div className="flex flex-col gap-1">
              {user ? (
                user.role === 'admin' ? (
                  // 관리자 모바일 메뉴
                  <>
                    <div className="px-4 py-3 mb-2 bg-primary-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-400" />
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-primary-200">시스템 관리자</div>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/admin/requests"
                      onClick={closeMenu}
                      className={`px-4 py-3 rounded flex items-center gap-3 ${
                        location.pathname.startsWith('/admin/requests') ? 'bg-primary-700' : 'hover:bg-primary-700'
                      }`}
                    >
                      <span className="w-6 text-center">📋</span>
                      <span>신청 관리</span>
                    </Link>
                    <Link
                      to="/admin/members"
                      onClick={closeMenu}
                      className={`px-4 py-3 rounded flex items-center gap-3 ${
                        isActive('/admin/members') ? 'bg-primary-700' : 'hover:bg-primary-700'
                      }`}
                    >
                      <span className="w-6 text-center">👥</span>
                      <span>회원 관리</span>
                    </Link>
                    <Link
                      to="/admin/settings"
                      onClick={closeMenu}
                      className={`px-4 py-3 rounded flex items-center gap-3 ${
                        isActive('/admin/settings') ? 'bg-primary-700' : 'hover:bg-primary-700'
                      }`}
                    >
                      <span className="w-6 text-center">⚙️</span>
                      <span>시스템 설정</span>
                    </Link>

                    <div className="border-t border-primary-500 my-2" />
                    <Link
                      to="/rules"
                      onClick={closeMenu}
                      className={`px-4 py-3 rounded flex items-center gap-3 ${
                        isActive('/rules') ? 'bg-primary-700' : 'hover:bg-primary-700'
                      }`}
                    >
                      <span className="w-6 text-center">📜</span>
                      <span>회칙</span>
                    </Link>

                    <div className="border-t border-primary-500 my-2" />
                    <button
                      onClick={handleLogout}
                      className="px-4 py-3 rounded text-left hover:bg-primary-700 flex items-center gap-3 text-primary-200"
                    >
                      <span className="w-6 text-center">🚪</span>
                      <span>로그아웃</span>
                    </button>
                  </>
                ) : (
                  // 일반 회원 모바일 메뉴
                  <>
                    <div className="px-4 py-3 mb-2 bg-primary-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          user.status === 'active' ? 'bg-green-400' :
                          user.status === 'pending' ? 'bg-blue-400' : 'bg-yellow-400'
                        }`} />
                        <div>
                          <div className="font-medium">{user.name}{user.position && ` (${user.position})`}</div>
                          <div className="text-xs text-primary-200">{STATUS_LABELS[user.status]} 회원</div>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/my"
                      onClick={closeMenu}
                      className={`px-4 py-3 rounded flex items-center gap-3 ${
                        isActive('/my') ? 'bg-primary-700' : 'hover:bg-primary-700'
                      }`}
                    >
                      <span className="w-6 text-center">🏠</span>
                      <span>내 정보</span>
                    </Link>
                    <Link
                      to="/rules"
                      onClick={closeMenu}
                      className={`px-4 py-3 rounded flex items-center gap-3 ${
                        isActive('/rules') ? 'bg-primary-700' : 'hover:bg-primary-700'
                      }`}
                    >
                      <span className="w-6 text-center">📜</span>
                      <span>회칙</span>
                    </Link>
                    {user.status !== 'pending' && (
                      <Link
                        to="/members"
                        onClick={closeMenu}
                        className={`px-4 py-3 rounded flex items-center gap-3 ${
                          isActive('/members') ? 'bg-primary-700' : 'hover:bg-primary-700'
                        }`}
                      >
                        <span className="w-6 text-center">👥</span>
                        <span>회원 명단</span>
                      </Link>
                    )}

                    <div className="border-t border-primary-500 my-2" />
                    <button
                      onClick={handleLogout}
                      className="px-4 py-3 rounded text-left hover:bg-primary-700 flex items-center gap-3 text-primary-200"
                    >
                      <span className="w-6 text-center">🚪</span>
                      <span>로그아웃</span>
                    </button>
                  </>
                )
              ) : (
                <>
                  <Link
                    to="/about"
                    onClick={closeMenu}
                    className={`px-4 py-3 rounded flex items-center gap-3 ${
                      isActive('/about') ? 'bg-primary-700' : 'hover:bg-primary-700'
                    }`}
                  >
                    <span className="w-6 text-center">🏊</span>
                    <span>모임 소개</span>
                  </Link>
                  <Link
                    to="/rules"
                    onClick={closeMenu}
                    className={`px-4 py-3 rounded flex items-center gap-3 ${
                      isActive('/rules') ? 'bg-primary-700' : 'hover:bg-primary-700'
                    }`}
                  >
                    <span className="w-6 text-center">📜</span>
                    <span>회칙</span>
                  </Link>
                  {isFull ? (
                    <div className="px-4 py-3 rounded flex items-center gap-3 text-primary-300 cursor-not-allowed">
                      <span className="w-6 text-center">✍️</span>
                      <span>정원 마감</span>
                    </div>
                  ) : (
                    <Link
                      to="/apply"
                      onClick={closeMenu}
                      className={`px-4 py-3 rounded flex items-center gap-3 ${
                        isActive('/apply') ? 'bg-primary-700' : 'hover:bg-primary-700'
                      }`}
                    >
                      <span className="w-6 text-center">✍️</span>
                      <span>가입 신청</span>
                    </Link>
                  )}
                  <div className="border-t border-primary-500 my-2" />
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="px-4 py-3 rounded bg-white text-primary-600 font-medium text-center"
                  >
                    로그인
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
