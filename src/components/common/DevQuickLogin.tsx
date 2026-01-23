import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// 개발용 빠른 로그인 활성화 (배포 시 false로 변경)
export const SHOW_DEV_LOGIN = true;

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
  {
    category: '휴면 회원 (활성 신청 테스트)',
    accounts: [
      { email: 'kangsoyeon@test.com', password: 'test123', name: '강소연', desc: '휴면 상태' },
      { email: 'joyounghoon@test.com', password: 'test123', name: '조영훈', desc: '휴면 상태' },
    ],
  },
  {
    category: '신규 회원 (환영 툴팁 테스트)',
    accounts: [
      { email: 'newmember@test.com', password: 'test123', name: '김신규', desc: '카톡방 미입장' },
    ],
  },
];

interface DevQuickLoginProps {
  onLoginSuccess?: () => void;
}

export default function DevQuickLogin({ onLoginSuccess }: DevQuickLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  if (!SHOW_DEV_LOGIN) return null;

  const handleDevLogin = async (devEmail: string, devPassword: string) => {
    setIsLoading(true);
    setError('');
    try {
      const loggedInUser = await login(devEmail, devPassword);
      if (loggedInUser) {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          if (loggedInUser.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
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
    <div className="bg-gray-800 md:rounded-lg md:shadow p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-yellow-400">🔧</span>
        <h2 className="text-sm font-bold text-yellow-400">개발용 빠른 로그인</h2>
        <span className="text-xs text-gray-400">(배포 시 비활성화)</span>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-900/50 text-red-300 rounded text-xs">
          {error}
        </div>
      )}

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
  );
}
