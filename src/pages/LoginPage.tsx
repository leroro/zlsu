import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

// 시스템 관리용 아이디 (이메일 형식이 아니어도 허용)
const SYSTEM_IDS = ['admin'];

// 개발용 빠른 로그인 활성화 (배포 시 false로 변경)
const SHOW_DEV_LOGIN = true;

// 개발용 테스트 계정 목록
const DEV_ACCOUNTS = [
  {
    category: '관리자',
    accounts: [
      { email: 'admin', password: 'zlsu2024!', name: '시스템관리자', desc: '전체 관리 권한' },
    ],
  },
  {
    category: '추천인 역할 (할 일 확인)',
    accounts: [
      { email: 'hansunwoo@test.com', password: 'test123', name: '한선우', desc: '김대기 승인 대기' },
      { email: 'leroro@inseq.co.kr', password: 'test123', name: '임미선', desc: '최신청 승인 대기' },
    ],
  },
  {
    category: '신청자 역할 (진행 상태 확인)',
    accounts: [
      { email: 'pending@test.com', password: 'test123', name: '김대기', desc: '추천인 동의 대기' },
      { email: 'pending2@test.com', password: 'test123', name: '이승인', desc: '관리자 승인 대기' },
      { email: 'pending3@test.com', password: 'test123', name: '박반려', desc: '추천인 반려됨' },
      { email: 'pending4@test.com', password: 'test123', name: '최신청', desc: '추천인 동의 대기' },
    ],
  },
  {
    category: '일반 회원',
    accounts: [
      { email: 'choisunsuk@test.com', password: 'test123', name: '최선숙', desc: '활성 회원' },
    ],
  },
];

export default function LoginPage() {
  useDocumentTitle('로그인');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // 이메일 형식 검증 (시스템 아이디 예외)
  const isValidEmailOrSystemId = (value: string) => {
    if (SYSTEM_IDS.includes(value)) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 이메일 형식 검증
    if (!isValidEmailOrSystemId(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser) {
        // 역할에 따라 다른 페이지로 이동
        if (loggedInUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');  // 일반 회원은 대시보드 홈으로
        }
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 개발용 빠른 로그인
  const handleDevLogin = async (devEmail: string, devPassword: string) => {
    setIsLoading(true);
    setError('');
    try {
      const loggedInUser = await login(devEmail, devPassword);
      if (loggedInUser) {
        if (loggedInUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError('로그인 실패 - 데이터 초기화가 필요할 수 있습니다.');
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white md:rounded-lg md:shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">로그인</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="text"
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="email@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          아직 회원이 아니신가요?{' '}
          <Link to="/apply" className="text-primary-600 hover:text-primary-700 font-medium">
            가입 신청
          </Link>
        </div>
      </div>

      {/* 개발용 빠른 로그인 섹션 */}
      {SHOW_DEV_LOGIN && (
        <div className="mt-6 bg-gray-800 md:rounded-lg md:shadow p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-400">🔧</span>
            <h2 className="text-sm font-bold text-yellow-400">개발용 빠른 로그인</h2>
            <span className="text-xs text-gray-400">(배포 시 비활성화)</span>
          </div>

          <div className="space-y-4">
            {DEV_ACCOUNTS.map((category) => (
              <div key={category.category}>
                <h3 className="text-xs font-medium text-gray-400 mb-2">{category.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {category.accounts.map((account) => (
                    <button
                      key={account.email}
                      onClick={() => handleDevLogin(account.email, account.password)}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-md transition-colors disabled:opacity-50 flex flex-col items-start"
                    >
                      <span className="font-medium">{account.name}</span>
                      <span className="text-gray-400 text-[10px]">{account.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              💡 데이터가 안 맞으면 새로고침(F5) 후 다시 시도하세요
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
