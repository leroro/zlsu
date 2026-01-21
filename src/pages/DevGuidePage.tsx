import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

// 개발용 화면 가이드 페이지
// 각 화면을 빠르게 확인할 수 있는 링크 모음

export default function DevGuidePage() {
  useDocumentTitle('개발 가이드');
  const sections = [
    {
      title: '비로그인 화면',
      links: [
        { path: '/', label: '홈 (랜딩 페이지)' },
        { path: '/about', label: '모임 소개' },
        { path: '/login', label: '로그인' },
        { path: '/rules', label: '회칙' },
      ],
    },
    {
      title: '가입 신청 단계별',
      links: [
        { path: '/apply', label: '가입 신청 - 일반 접근' },
        { path: '/apply?step=1', label: '1단계: 회칙 확인' },
        { path: '/apply?step=2', label: '2단계: 기본 정보' },
        { path: '/apply?step=3', label: '3단계: 부가 정보' },
        { path: '/apply?step=complete', label: '가입 완료 화면' },
        { path: '/apply?step=full', label: '정원 마감 화면' },
      ],
    },
    {
      title: '승인 대기 회원 화면',
      description: '로그인 필요 (승인대기 계정: pending@test.com / test123)',
      links: [
        { path: '/', label: '홈 (승인 대기 안내)' },
        { path: '/my', label: '내 정보' },
      ],
    },
    {
      title: '일반 회원 화면',
      description: '로그인 필요 (일반 회원 계정)',
      links: [
        { path: '/', label: '홈 (대시보드)' },
        { path: '/my', label: '내 정보' },
        { path: '/members', label: '회원 명단' },
        { path: '/change-status', label: '상태 전환 신청' },
        { path: '/withdraw', label: '탈퇴 신청' },
      ],
    },
    {
      title: '관리자 화면',
      description: '로그인 필요 (관리자 계정)',
      links: [
        { path: '/admin', label: '관리자 대시보드' },
        { path: '/admin/requests', label: '신청 관리' },
        { path: '/admin/members', label: '회원 관리' },
        { path: '/admin/settings', label: '시스템 설정' },
        { path: '/admin/checklist', label: '체크리스트 관리' },
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white md:rounded-lg md:shadow p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">🛠️ 개발 가이드</h1>
          <p className="text-sm text-gray-500">
            각 화면을 빠르게 확인할 수 있는 링크 모음입니다.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-1">{section.title}</h2>
              {section.description && (
                <p className="text-xs text-gray-500 mb-3">{section.description}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {section.links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <span className="text-gray-400">→</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">테스트 계정</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>관리자:</strong> admin / zlsu2024!</p>
            <p><strong>일반회원:</strong> hansunwoo@test.com / test123</p>
            <p><strong>승인대기:</strong> pending@test.com / test123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
