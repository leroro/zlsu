import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-primary-600 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold hover:text-primary-100">
            즐수팀
          </Link>

          <nav className="flex items-center gap-4">
            <Link to="/rules" className="hover:text-primary-100">
              회칙
            </Link>

            {user ? (
              <>
                <Link to="/members" className="hover:text-primary-100">
                  회원목록
                </Link>
                <Link to="/my" className="hover:text-primary-100">
                  내정보
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="hover:text-primary-100">
                    관리자
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-primary-700 rounded hover:bg-primary-800"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/apply" className="hover:text-primary-100">
                  가입신청
                </Link>
                <Link
                  to="/login"
                  className="px-3 py-1 bg-white text-primary-600 rounded hover:bg-primary-50"
                >
                  로그인
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
